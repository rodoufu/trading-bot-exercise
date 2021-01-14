import {WETH, ChainId, Token as TokenSushiSwap, Price} from '@sushiswap/sdk'
import {Blockchain, RouterContract} from "./blockchain";
import {getPrice as getPriceSushiswap} from "./sushiswap";
import {getPrice as getPriceUniswap} from "./uniswap";
import {TradeDaoInterface} from "./dao";
import {Fraction} from "@uniswap/sdk";

export interface TraderInterface {
	findSpreadAndTrade(): Promise<void>;

	calculateProfitBps(priceBuying: Price, priceSelling: Price): Fraction;
}

export class TraderMath implements TraderInterface {
	calculateProfitBps(priceBuying: Price, priceSelling: Price): Fraction {
		const profit = priceSelling.subtract(priceBuying);
		const profitRatio = profit.divide(priceBuying);
		// Converting to bases points
		return profitRatio.multiply("10000");
	}

	findSpreadAndTrade(): Promise<void> {
		return Promise.resolve(undefined);
	}

}

export class Trader extends TraderMath {
	private readonly blockchain: Blockchain;
	private readonly logger: any;
	private readonly tradeDao: TradeDaoInterface;
	private readonly minimumProfitBps: number;
	private initiatedTransaction: boolean = false;

	constructor(blockchain: Blockchain, tradeDao: TradeDaoInterface, logger: any = console) {
		super();
		this.blockchain = blockchain;
		this.logger = logger;
		this.tradeDao = tradeDao;
		this.minimumProfitBps = +(process.env.MINIMUM_PROFIT_BPS || "50");

		const uniSwapAddress: string = process.env.UNISWAP_ADDRESS || "";
		const uniSwapV2Address: string = process.env.UNISWAP_V2_ADDRESS || "";
		const sushiSwapAddress: string = process.env.SUSHISWAP_ADDRESS || "";
		const tokenContractAddress: string = process.env.TOKEN_CONTRACT_ADDRESS || "";
		const wEthTokenContractAddress: string = process.env.WETH_TOKEN_CONTRACT_ADDRESS || "";

		const sushiSwap = new RouterContract(blockchain, sushiSwapAddress);
		const uniSwap = new RouterContract(blockchain, uniSwapAddress);
		const uniSwapV2 = new RouterContract(blockchain, uniSwapV2Address);
	}

	async findSpreadAndTrade() {
		const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
		const daiDecimals = 18;
		let dai = new TokenSushiSwap(ChainId.MAINNET, daiAddress, daiDecimals);

		let priceSushiSwapPromise = getPriceSushiswap(
			WETH[dai.chainId], dai, this.blockchain.getRouterSwapProvider(),
		);
		let priceUniswapPromise = getPriceUniswap(
			WETH[dai.chainId], dai, this.blockchain.getRouterSwapProvider(),
		);

		let prices = await Promise.all([priceSushiSwapPromise, priceUniswapPromise]);
		let priceSushiSwap = prices[0];
		let priceUniswap = prices[1];

		this.logger.info(`SushiSwap: ${priceSushiSwap.toSignificant(6)}`);
		this.logger.info(`Uniswap: ${priceUniswap.toSignificant(6)}`);
		const profit = this.calculateProfitBps(priceUniswap, priceSushiSwap);
		if (profit > new Fraction(this.minimumProfitBps.toString())) {
			this.logger.info(`${profit}bps of spread identified`);
			if (!this.initiatedTransaction) {
				try {
					this.initiatedTransaction = true;
				} finally {
					this.initiatedTransaction = false;
				}
			} else {
				this.logger.warn(`There is a transaction in progress.`);
			}
		} else {
			this.logger.info(`Not enough spread identified`);
		}
	}

}

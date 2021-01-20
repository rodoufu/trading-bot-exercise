import {WETH, ChainId, Token, Price} from '@sushiswap/sdk'
import {Blockchain, RouterContract} from "./blockchain";
import {getPrice as getPriceSushiswap} from "./sushiswap";
import {getPrice as getPriceUniswap} from "./uniswap";
import {TradeDaoInterface} from "./dao";
import {Fraction} from "@uniswap/sdk";

export interface TraderInterface {
	findSpreadAndTrade(): Promise<void>;

	calculateProfitBps(priceBuying: Price, priceSelling: Price): Fraction;

	getPriceUniswap(token: Token): Promise<Price>;

	getPriceSushiSwap(token: Token): Promise<Price>;
}

export class Trader implements TraderInterface {
	private readonly blockchain: Blockchain;
	private readonly logger: any;
	private readonly tradeDao: TradeDaoInterface;
	private readonly minimumProfitBps: number;
	private readonly tradeToken: Token;
	private initiatedTransaction: boolean = false;

	constructor(blockchain: Blockchain, tradeDao: TradeDaoInterface, logger: any = console) {
		this.blockchain = blockchain;
		this.logger = logger;
		this.tradeDao = tradeDao;
		this.minimumProfitBps = +(process.env.MINIMUM_PROFIT_BPS || "50");

		const tokenContractAddress: string = process.env.TOKEN_CONTRACT_ADDRESS || "";
		const tokenContractDecimals = +(process.env.MINIMUM_PROFIT_BPS || "18");
		const chainId: number = +(process.env.NETWORK || "1");

		this.tradeToken = new Token(chainId, tokenContractAddress, tokenContractDecimals);
	}

	async findSpreadAndTrade() {
		let prices = await Promise.all([
			this.getPriceSushiSwap(this.tradeToken),
			this.getPriceUniswap(this.tradeToken),
		]);
		let priceSushiSwap = prices[0];
		let priceUniswap = prices[1];

		this.logger.info(`SushiSwap price: ${priceSushiSwap.toSignificant(6)}`);
		this.logger.info(`Uniswap price: ${priceUniswap.toSignificant(6)}`);
		const profit = this.calculateProfitBps(priceUniswap, priceSushiSwap);
		if (profit.greaterThan(this.minimumProfitBps.toString())) {
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

	calculateProfitBps(priceBuying: Price, priceSelling: Price): Fraction {
		const profit = priceSelling.subtract(priceBuying);
		const profitRatio = profit.divide(priceBuying);
		// Converting to bases points
		return profitRatio.multiply("10000");
	}

	async getPriceSushiSwap(token: Token): Promise<Price> {
		return await getPriceSushiswap(
			WETH[token.chainId], token, this.blockchain.getRouterSwapProvider(),
		);
	}

	async getPriceUniswap(token: Token): Promise<Price> {
		return await getPriceUniswap(
			WETH[token.chainId], token, this.blockchain.getRouterSwapProvider(),
		);
	}

}

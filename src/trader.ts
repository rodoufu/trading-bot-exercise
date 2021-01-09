import {WETH, ChainId, Token as TokenSushiSwap} from '@sushiswap/sdk'
import {Token as TokenUniswap} from '@sushiswap/sdk'
import {Blockchain, RouterContract} from "./blockchain";
import {getPrice as getPriceSushiswap} from "./sushiswap";
import {getPrice as getPriceUniswap} from "./uniswap";
import {TradeDaoInterface} from "./dao";

export class Trader {
	private readonly blockchain: Blockchain;
	private readonly logger: any;
	private readonly tradeDao: TradeDaoInterface;

	constructor(blockchain: Blockchain, tradeDao: TradeDaoInterface, logger: any = console) {
		this.blockchain = blockchain;
		this.logger = logger;
		this.tradeDao = tradeDao;

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
			WETH[dai.chainId], dai, this.blockchain.web3.currentProvider,
		);
		let priceUniswapPromise = getPriceUniswap(
			WETH[dai.chainId], dai, this.blockchain.web3.currentProvider,
		);

		let prices = await Promise.all([priceSushiSwapPromise, priceUniswapPromise]);
		let priceSushiSwap = prices[0];
		let priceUniswap = prices[1];

		this.logger.info(`SushiSwap: ${priceSushiSwap.toSignificant(6)}`);
		this.logger.info(`Uniwap: ${priceUniswap.toSignificant(6)}`);
	}
}

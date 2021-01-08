// import express, {Request, Response} from "express";
import {
	Blockchain,
	Router
} from "./blockchain";
import {toWei} from "web3-utils";

(async () => {
	let logger: any = console;
	logger.log("I'm a trading bot");

	const uniSwapAddress: string = process.env.UNISWAP_ADDRESS || "";
	const uniSwapV2Address: string = process.env.UNISWAP_V2_ADDRESS || "";
	const sushiSwapAddress: string = process.env.SUSHISWAP_ADDRESS || "";
	const tokenContractAddress: string = process.env.TOKEN_CONTRACT_ADDRESS || "";
	const wEthTokenContractAddress: string = process.env.WETH_TOKEN_CONTRACT_ADDRESS || "";
	let blockchain: Blockchain | null = null;

	try {
		blockchain = new Blockchain();

		// logger.info(`Latest block is ${await blockchain.web3.eth.getBlockNumber()}`);

		const sushiSwap = new Router(blockchain, sushiSwapAddress);
		const uniSwap = new Router(blockchain, uniSwapAddress);
		const uniSwapV2 = new Router(blockchain, uniSwapV2Address);

		// const amountsIn = await uniSwapV2.getAmountsIn(
		// 	toWei('1', 'ether'),
		// 	[wEthTokenContractAddress, tokenContractAddress],
		// );
		//
		// logger.info(`Min amount is ${amountsIn}`);

		blockchain.onNewBlock((err, data) => {
			if (err) {
				logger.error(`Subscribe error`, err.message);
				throw err;
			} else {
				logger.info(`New block: ${JSON.stringify(data)}`);
			}
		});
	} catch (err) {
		logger.error(`Unexpected error: ${err}`);
		throw err;
	} finally {
		if (blockchain) {
			blockchain.close();
		}
	}
})();

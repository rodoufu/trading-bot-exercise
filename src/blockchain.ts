import Web3 from "web3";
import {
	AbstractProvider,
	HttpProvider,
	IpcProvider,
	provider,
	WebsocketProvider
} from "web3-core";

const HDWalletProvider = require('@truffle/hdwallet-provider');
// import HDWalletProvider from '@truffle/hdwallet-provider';

const IRouterDescriptor = require("../contracts/IRouter.json");
const TraderDescriptor = require("../contracts/Trader.json");

const {getNetwork} = require('../truffle-config');

export class Blockchain {
	web3Provider: provider;
	web3: Web3;

	constructor() {
		this.web3Provider = getNetwork().provider();
		this.web3 = new Web3(this.web3Provider);
	}

	getRouter(address: string) {
		return new this.web3.eth.Contract(IRouterDescriptor.abi, address);
	}

	getTrader(address: string) {
		return new this.web3.eth.Contract(TraderDescriptor.abi, address);
	}

	close() {
		let provider: any = this.web3.currentProvider;
		if (provider['disconnect'] !== undefined) {
			provider.disconnect();
		} else if (provider['connection'] !== undefined) {
			provider.connection.close();
		} else if (provider['engine'] !== undefined) {
			provider.engine.stop();
		}
	}
}

export class Trader {
	contract: any;

	constructor(blockchain: Blockchain, contractAddress: string) {
		this.contract = blockchain.getTrader(contractAddress);
	}

	async trade(from: string, to: string, fromAmount: string, targetAmount: string): Promise<string> {
		return await this.contract.methods.trade(from, to, fromAmount, targetAmount).send();
	}
}

export class Router {
	contract: any;

	constructor(blockchain: Blockchain, contractAddress: string) {
		this.contract = blockchain.getRouter(contractAddress);
	}

	async swapExactTokensForETH(
		amountIn: string, amountOutMin: string, callData: string[], to: string, deadline: string,
	): Promise<string[]> {
		return await this.contract.methods.swapExactTokensForETH(
			amountIn, amountOutMin, callData, to, deadline,
		).send();
	}

	async swapExactETHForTokens(
		amountOutMin: string, callData: string[], to: string, deadline: string,
	): Promise<string[]> {
		return await this.contract.methods.swapExactETHForTokens(
			amountOutMin, callData, to, deadline,
		).send();
	}

	async getAmountsIn(
		amountOut: string, callData: string[],
	): Promise<string[]> {
		return await this.contract.methods.getAmountsIn(
			amountOut, callData,
		).call();
	}
}

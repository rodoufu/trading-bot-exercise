import Web3 from "web3";
import {provider} from "web3-core";

const HDWalletProvider = require('@truffle/hdwallet-provider');

const IRouterDescriptor = require("../contracts/IRouter.json");
const TraderDescriptor = require("../contracts/Trader.json");

const {getNetwork} = require('../truffle-config');

export class Blockchain {
	private readonly web3Provider: provider;
	private readonly wsWeb3Provider?: provider;
	readonly web3: Web3;
	private readonly wsWeb3?: Web3;

	constructor() {
		let getProviderAndWeb3 = (network: any): [provider, Web3] => {
			let web3Provider: provider;
			if (network['provider'] !== undefined) {
				web3Provider = network.provider();
			} else {
				web3Provider = new Web3.providers.WebsocketProvider(
					network.host,
					{
						clientConfig: {
							keepAlive: true,
							maxReceivedFrameSize: 100000000,
							maxReceivedMessageSize: 100000000,
						},
						reconnect: {
							auto: true,
						},
					}
				);
			}
			return [web3Provider, new Web3(web3Provider)];
		}
		const networks: any[] = getNetwork();
		let providerWeb3 = getProviderAndWeb3(networks[0]);
		this.web3Provider = providerWeb3[0];
		this.web3 = providerWeb3[1];

		if (networks[1]) {
			providerWeb3 = getProviderAndWeb3(networks[1]);
			this.wsWeb3Provider = providerWeb3[0];
			this.wsWeb3 = providerWeb3[1];
		}
	}

	getRouter(address: string) {
		return new this.web3.eth.Contract(IRouterDescriptor.abi, address);
	}

	getTrader(address: string) {
		return new this.web3.eth.Contract(TraderDescriptor.abi, address);
	}

	close() {
		let providers: any[] = [this.web3.currentProvider];
		if (this.wsWeb3) {
			providers.push(this.wsWeb3.currentProvider);
		}

		for (let provider of providers) {
			if (provider['disconnect'] !== undefined) {
				provider.disconnect();
			} else if (provider['connection'] !== undefined) {
				provider.connection.close();
			} else if (provider['engine'] !== undefined) {
				provider.engine.stop();
			}
		}
	}

	subscribe(typeName: string, callback: (err: Error, data: any) => void) {
		if (this.wsWeb3 === undefined) {
			throw `No websocket provider present`;
		}
		this.wsWeb3.eth.subscribe(typeName as any, callback);
	}

	onNewBlock(callback: (err: Error, data: any) => void) {
		this.subscribe('newBlockHeaders', callback);
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
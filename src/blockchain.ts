import Web3 from "web3";

const {getNetwork} = require('../truffle-config');

export class Blockchain {
	web3Provider: any;
	web3: Web3;

	constructor() {
		this.web3Provider = getNetwork().provider();
		this.web3 = new Web3(this.web3Provider);
	}
}

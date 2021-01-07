import {Blockchain} from "./blockchain";

(async () => {
	console.log("I'm a trading bot");
	try {
		const blockchain = new Blockchain();

		console.info(`Latest block is ${await blockchain.web3.eth.getBlockNumber()}`);
	} catch (err) {
		console.error(`Unexpected error: ${err}`);
	}
})();

import express, {Request, Response} from "express";
import {Blockchain} from "./blockchain";
import {Trader} from "./trader";
import {Trade, TraderRestServer} from "./server";
import {InMemoryTradeDao, TradeDaoInterface} from "./dao";

(async () => {
	let logger: any = console;
	logger.log("I'm a trading bot");

	let blockchain: Blockchain | null = null;
	let server: TraderRestServer | null = null;

	try {
		blockchain = new Blockchain();
		const tradeDao = new InMemoryTradeDao();
		const trader = new Trader(blockchain, tradeDao, logger);
		// TODO Remove these debug trades
		tradeDao.persist(new Trade(
			"1", new Date(), "from1", "to1", "fromAmount1", "targetAmount1",
			"receivedAmount1"
		));
		tradeDao.persist(new Trade(
			"2", new Date(), "from2", "to2", "fromAmount2", "targetAmount2",
			"receivedAmount2"
		));
		server = new TraderRestServer(tradeDao, logger);

		blockchain.onNewBlock(async (err, data) => {
			if (err) {
				logger.error(`Subscribe error`, err.message);
				if (blockchain) {
					blockchain.close();
				}
				if (server) {
					server.close();
				}
				throw err;
			} else {
				try {
					logger.info(`New block ${JSON.stringify(data.number)}`);
					await trader.findSpreadAndTrade();
				} catch (err) {
					logger.error(`Unexpected error: ${err}`);
				}
			}
		});

		server.start(+(process.env.APP_PORT || "3000"));
	} catch (err) {
		logger.error(`Unexpected error: ${err}`);
		if (blockchain) {
			blockchain.close();
		}
		if (server) {
			server.close();
		}
		throw err;
	}
})();

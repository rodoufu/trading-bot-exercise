import {Blockchain} from "./blockchain";
import {Trader, TraderInterface} from "./trader";
import {TraderRestServer} from "./server";
import {PostgresDB, TradeDaoInterface} from "./dao";

(async () => {
	// Add a real logger here
	let logger: any = console;
	logger.log("I'm a trading bot");

	let blockchain: Blockchain | null = null;
	let server: TraderRestServer | null = null;
	let trader: TraderInterface | null = null;
	let tradeDao: TradeDaoInterface | null = null;

	let closeAll = () => {
		blockchain?.close();
		server?.close();
		tradeDao?.close();
	};

	try {
		// We could use dependency injection here
		blockchain = new Blockchain();
		const postgresDB = new PostgresDB();
		await postgresDB.create();
		tradeDao = postgresDB;
		trader = new Trader(blockchain, tradeDao, logger);

		server = new TraderRestServer(tradeDao, logger);

		blockchain.onNewBlock(async (err, data) => {
			if (err) {
				logger.error(`Subscribe error`, err.message);
				closeAll();
				throw err;
			} else {
				try {
					logger.info(`New block ${JSON.stringify(data.number)}`);
					if (trader !== null) {
						await trader.findSpreadAndTrade();
					} else {
						logger.error(`Trader should not be null`);
						closeAll();
						process.exit(1);
					}
				} catch (err) {
					logger.error(`Unexpected error: ${err}`);
				}
			}
		});

		server.start(+(process.env.APP_PORT || "3000"));
	} catch (err) {
		logger.error(`Unexpected error: ${err}`);
		closeAll();
		throw err;
	}
})();

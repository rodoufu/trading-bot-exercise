import express, {Request, Response} from "express";
import http from "http";
import {BigintIsh} from "@uniswap/sdk";
import {TradeDaoInterface} from "./dao";

export class Trade {
	readonly id: string;
	readonly createdAt: Date;
	readonly from: string;
	readonly to: string;
	readonly fromAmount: BigintIsh;
	readonly targetAmount: BigintIsh;
	readonly receivedAmount: BigintIsh;

	constructor(
		id: string, createdAt: Date, from: string, to: string, fromAmount: BigintIsh, targetAmount: BigintIsh,
		receivedAmount: BigintIsh,
	) {
		this.id = id;
		this.createdAt = createdAt;
		this.from = from;
		this.to = to;
		this.fromAmount = fromAmount;
		this.targetAmount = targetAmount;
		this.receivedAmount = receivedAmount;
	}
}

export class TraderRestServer {
	private readonly app: express.Application;
	private httpServer?: http.Server;
	private readonly logger: any;
	private readonly tradeDao: TradeDaoInterface;

	constructor(tradeDao: TradeDaoInterface, logger: any = console) {
		this.tradeDao = tradeDao;
		this.logger = logger;
		this.app = express();
		this.app.use(express.json());

		let traderServer = this;
		this.app.get("/trades", async (req: Request, resp: Response) => {
			resp.send(traderServer.getTrades());
		});
		this.app.get("/trades/:id", async (req: Request, resp: Response) => {
			let id: string | null = req.params.id;
			resp.send(traderServer.getTrades(id));
		});
	}

	getTrades(id?: string): Trade[] {
		if (id !== undefined) {
			const trade = this.tradeDao.findById(id);
			if (trade !== undefined) {
				return [trade as Trade];
			} else {
				return [];
			}
		} else {
			const trades: Trade[] = [];
			for (let trade of this.tradeDao.findAll()) {
				trades.push(trade);
			}
			return trades;
		}
	}

	/**
	 * Starts the Express server.
	 * @param port Port number to listen.
	 */
	start(port: number): void {
		let localLogger = this.logger;
		this.httpServer = this.app.listen(port, function () {
			localLogger.warn(`App is listening on port ${port}!`);
		});
	}

	close() {
		if (this.httpServer) {
			this.logger.warn(`Close operation initiated`);
			this.httpServer.close(() => {
				this.logger.warn(`Close operation finished`);
			});
		}
	}
}

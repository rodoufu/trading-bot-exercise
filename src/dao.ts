import {Trade} from "./server";
import {Pool} from "pg";

export interface TradeDaoInterface {
	findAll(): AsyncGenerator<Trade>;

	findById(id: string): Promise<Trade | null>;

	persist(trade: Trade): Promise<void>;

	close(): void;
}

export class InMemoryTradeDao implements TradeDaoInterface {
	private readonly idTrade: Map<string, Trade>;

	constructor() {
		this.idTrade = new Map<string, Trade>();
	}

	async* findAll(): AsyncGenerator<Trade> {
		for (let trade of this.idTrade.values()) {
			yield trade;
		}
	}

	async findById(id: string): Promise<Trade | null> {
		let trade = this.idTrade.get(id);
		if (trade) {
			return trade as Trade;
		} else {
			return null;
		}
	}

	async persist(trade: Trade) {
		this.idTrade.set(trade.id, trade);
	}

	close(): void {
	}
}

export class ConnectionInfo {
	readonly host: string;
	readonly user: string;
	readonly password: string;
	readonly database: string;

	constructor(host: string, user: string, password: string, database: string) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.database = database;
	}
}

export class PostgresDB implements TradeDaoInterface {
	private readonly pool: Pool;

	constructor(connectionInfo?: ConnectionInfo) {
		if (connectionInfo !== undefined) {
			this.pool = new Pool({
				host: connectionInfo.host,
				user: connectionInfo.user,
				password: connectionInfo.password,
				database: connectionInfo.database,
			});
		} else {
			this.pool = new Pool();
		}
	}

	close(): void {
		this.pool.end();
	}

	async* findAll(): AsyncGenerator<Trade> {
		const query = `select "id", "createdAt", "from", "to", "fromAmount", "targetAmount", "receivedAmount"
                       from public.trades t`;
		const respQuery = await this.pool.query(query, []);
		for (let line of respQuery.rows) {
			yield new Trade(
				line.id, line.createdAt, line.from, line.to, line.fromAmount, line.targetAmount, line.receivedAmount,
			);
		}
	}

	async findById(id: string): Promise<Trade | null> {
		const query = `select "id", "createdAt", "from", "to", "fromAmount", "targetAmount", "receivedAmount"
                       from public.trades t
                       where id = $1`;
		const respQuery = await this.pool.query(query, [id]);
		if (respQuery.rowCount === 0) {
			return null;
		}
		let line = respQuery.rows[0];
		return new Trade(
			line.id, line.createdAt, line.from, line.to, line.fromAmount, line.targetAmount, line.receivedAmount,
		);
	}

	async persist(trade: Trade) {
		const client = await this.pool.connect();
		try {
			await client.query('BEGIN');

			const query = `INSERT INTO public.trades("id", "createdAt", "from", "to", "fromAmount", "targetAmount",
                                                     "receivedAmount")
                           VALUES ($1, $2, $3, $4, $5, $6, $7)`;

			const resp = await this.pool.query(
				query, [
					trade.id, trade.createdAt, trade.from, trade.to, trade.fromAmount, trade.targetAmount,
					trade.receivedAmount
				]
			);
			if (resp.rowCount !== 1) {
				throw `There was a problem trying to save the trade`;
			}

			await client.query('COMMIT');
		} catch (e) {
			await client.query('ROLLBACK');
			throw e;
		} finally {
			client.release();
		}
	}

	async create() {
		const query = `SELECT EXISTS(SELECT *
                                     FROM information_schema.tables
                                     WHERE table_schema = 'public'
                                       and table_name = 'trades');`
		const resp = await this.pool.query(query);
		if (resp.rowCount === 0) {
			throw `There was a problem connecting to the database`;
		}
		const queryCreateDb = `CREATE TABLE public.trades
                               (
                                   "id"             int         NOT NULL,
                                   "createdAt"      timestamptz NOT NULL,
                                   "from"           varchar     NOT NULL,
                                   "to"             varchar     NOT NULL,
                                   "fromAmount"     varchar     NOT NULL,
                                   "targetAmount"   varchar     NOT NULL,
                                   "receivedAmount" varchar     NOT NULL,
                                   CONSTRAINT trades_pk PRIMARY KEY (id)
                               );`;
		if (!resp.rows[0].exists) {
			await this.pool.query(queryCreateDb);
		}
	}
}

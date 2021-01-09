import {Trade} from "./server";

export interface TradeDaoInterface {
	findAll(): IterableIterator<Trade>;

	findById(id: string): Trade | null;

	persist(trade: Trade);
}

export class InMemoryTradeDao implements TradeDaoInterface {
	private readonly idTrade: Map<string, Trade>;

	constructor() {
		this.idTrade = new Map<string, Trade>();
	}

	*findAll(): IterableIterator<Trade> {
		for (let trade of this.idTrade.values()) {
			yield trade;
		}
	}

	findById(id: string): Trade | null {
		let trade = this.idTrade.get(id);
		if (trade) {
			return trade as Trade;
		}
		return null;
	}

	persist(trade: Trade) {
		this.idTrade.set(trade.id, trade);
	}

}
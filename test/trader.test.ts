import {Trader} from "../src/trader";
import {Price, Currency} from "@uniswap/sdk";
import {Blockchain} from "../src/blockchain";
import {InMemoryTradeDao} from "../src/dao";

test('Calculating profit 100bps', () => {
	const trader = new Trader(new Blockchain(), new InMemoryTradeDao());
	let buyPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1000");
	let sellPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1010");
	let profit = trader.calculateProfitBps(buyPrice, sellPrice);

	expect(profit.toFixed(0)).toBe("100");
});

test('Calculating profit - loss 100bps', () => {
	const trader = new Trader(new Blockchain(), new InMemoryTradeDao());
	let buyPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1000");
	let sellPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "990");
	let profit = trader.calculateProfitBps(buyPrice, sellPrice);

	expect(profit.toFixed(0)).toBe("-100");
});

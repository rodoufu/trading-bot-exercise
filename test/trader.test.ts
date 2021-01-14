import {TraderMath} from "../src/trader";
import {Price, Currency} from "@uniswap/sdk";

test('Calculating profit 100bps', () => {
	let trader = new TraderMath();
	let buyPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1000");
	let sellPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1010");
	let profit = trader.calculateProfitBps(buyPrice, sellPrice);

	expect(profit.toFixed(0)).toBe("100");
});

test('Calculating profit - loss 100bps', () => {
	let trader = new TraderMath();
	let buyPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "1000");
	let sellPrice = new Price(Currency.ETHER, Currency.ETHER, "1", "990");
	let profit = trader.calculateProfitBps(buyPrice, sellPrice);

	expect(profit.toFixed(0)).toBe("-100");
});

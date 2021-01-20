// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./IRouter.sol";

contract Trader {
	address constant public Uniswap = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
	address constant public SushiSwap = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
	address constant public Dai = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
	uint constant public deadLine = 300;

	function trade(address from, address to, uint fromAmount, uint targetAmount) public returns (uint) {
		return this.tradeRouters(
			Uniswap, SushiSwap, from, to, fromAmount, targetAmount
		);
	}

	function tradeRouters(
		address addressRouterA, address addressRouterB, address from, address to, uint fromAmount, uint targetAmount
	) public returns (uint) {
		IRouter routerA = IRouter(addressRouterA);
		address[] memory buyingPath = new address[](2);
		buyingPath[0] = Dai;
		buyingPath[1] = routerA.WETH();
		uint[] memory amountsEth = routerA.swapExactTokensForETH(
			fromAmount, targetAmount, buyingPath, from, now + deadLine
		);

		IRouter routerB = IRouter(addressRouterB);
		address[] memory sellingPath = new address[](2);
		sellingPath[0] = routerB.WETH();
		sellingPath[1] = Dai;
		uint[] memory amountsDai = routerB.swapExactETHForTokens(
			amountsEth[0], sellingPath, to, now + deadLine
		);
		return amountsDai[0];
	}
}

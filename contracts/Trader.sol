// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./IRouter.sol";

contract Trader {
	address constant public Uniswap = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
	address constant public SushiSwap = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

	function trade(address from, address to, uint fromAmount, uint targetAmount) public returns (uint) {
		return this.tradeRouters(
			Uniswap, SushiSwap, from, to, fromAmount, targetAmount
		);
	}

	function tradeRouters(
		address addressRouterA, address addressRouterB, address from, address to, uint fromAmount, uint targetAmount
	) public returns (uint) {
		IRouter routerA = IRouter(addressRouterA);
		IRouter routerB = IRouter(addressRouterB);
		uint[] amountsEth = routerA.swapExactTokensForETH(fromAmount, targetAmount, [], to, now + 300);
//		routerA.swapExactETHForTokens()
//		return receivedAmount;
		return fromAmount;
	}
}

// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "./IRouter.sol";

contract Trader {
	function trade(address from, address to, uint fromAmount, uint targetAmount) public returns (uint) {
		// Buying from Uniswap and selling on SushiSwap
		return this.tradeRouters(
			0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F, from, to,
			fromAmount, targetAmount
		);
	}

	function tradeRouters(
		address addressRouterA, address addressRouterB, address from, address to, uint fromAmount, uint targetAmount
	) public returns (uint) {
		IRouter routerA = IRouter(addressRouterA);
		IRouter routerB = IRouter(addressRouterB);
//		routerA.swapExactETHForTokens()
//		return receivedAmount;
		return fromAmount;
	}
}

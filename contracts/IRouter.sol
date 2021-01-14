// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface IRouter {
	function swapExactTokensForETH(
		uint amountIn,
		uint amountOutMin,
		address[] calldata path,
		address to,
		uint deadline
	) external returns (uint[] memory amounts);

	function swapExactETHForTokens(
		uint amountOutMin,
		address[] calldata path,
		address to,
		uint deadline
	) external payable returns (uint[] memory amounts);

	function getAmountsIn(
		uint amountOut, address[] calldata path
	) external view returns (uint[] memory amounts);
}

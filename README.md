# Trading Bot

## Main features

This is a simple trading bot that will arbitrage between Uniswap and SushiSwap (Buy from Uniswap then Sell on SushiSwap).

The bot will, in one transaction, buy ETH with 1000 DAI from Unsiwap, then sell ETH for DAI on SushiSwap at a profit.
For simplicity, it will ignore gas consideration.

The bot will listen to price changes on a block by block basis and execute the trade when the profit is higher than 50bps.

It is using the standard SDKs:
- Uniswap: https://www.npmjs.com/package/@uniswap/sdk
- SushiSwap: https://www.npmjs.com/package/@sushiswap/sdk

The smart contract to implement the buy and sell looks like this:

```solidity
contract Trader {
    function trade(address from, address to, uint fromAmount, uint targetAmount) {
        return receivedAmount;
    }
}
```

To interact with Uniswap and SushiSwap, the IRouter interface below can be used in mainnet:

Uniswap: `0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D`

SushiSwap: `0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F`

```solidity
interface IRouter {
    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
    external
    returns (uint[] memory amounts);

     function swapExactETHForTokens(
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    )
    external
    payable
    returns (uint[] memory amounts);
}
```

## Other features

- The results of the trade (datetime, from, to, fromAmount, targetAmount, receivedAmount) are saved on a local DB (files/SQL/noSQL..).
- The results of the trade are accessible using a URL (GET URL/trades).

## Notes

- ETH is expressed in decimals (or Wei), `1 ETH = 1e18 Wei` (or `10^18`). The same applies to DAI.
- ETH is represented by the address `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
- Uniswap & SushiSwap support WETH only

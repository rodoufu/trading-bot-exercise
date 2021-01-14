import {ChainId, Token, Fetcher, Route, Price} from '@sushiswap/sdk'

export async function getPrice(baseToken: Token, quoteToken: Token, webProvider?:any): Promise<Price> {
	const pair = await Fetcher.fetchPairData(quoteToken, baseToken, webProvider);

	const route = new Route([pair], baseToken);
	return route.midPrice;
}

export {
	Token,
	ChainId,
}

export type QuoteResponse = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

export function parseTopMovers(payload: any) {
  const list = payload?.top_gainers ?? payload?.top_losers;
  if (!Array.isArray(list)) return [];
  return list.slice(0, 5).map((item: any) => ({
    ticker: item.ticker,
    price: Number(item.price) || 0,
    change: Number(item.change_amount) || 0,
    changePercent: Number(item.change_percentage?.replace?.("%", "")) || 0
  }));
}

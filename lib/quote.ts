export type QuoteResponse = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
  latestTradingDay: string;
};

export function parseAlphaVantageQuote(payload: any): QuoteResponse | null {
  const raw = payload?.["Global Quote"];
  if (!raw) return null;

  const getNum = (key: string) => {
    const val = raw[key];
    const num = typeof val === "string" ? Number(val) : NaN;
    return Number.isFinite(num) ? num : 0;
  };

  return {
    symbol: raw["01. symbol"] ?? "N/A",
    price: getNum("05. price"),
    change: getNum("09. change"),
    changePercent: getNum("10. change percent"),
    high: getNum("03. high"),
    low: getNum("04. low"),
    previousClose: getNum("08. previous close"),
    latestTradingDay: raw["07. latest trading day"] ?? ""
  };
}

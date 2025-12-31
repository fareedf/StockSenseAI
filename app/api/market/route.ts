import { NextResponse } from "next/server";
import OpenAI from "openai";
import { parseAlphaVantageQuote } from "@/lib/quote";

const marketApiKey = process.env.MARKET_DATA_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const INDEX_SYMBOLS = [
  { label: "S&P 500 (SPY)", symbol: "SPY" },
  { label: "Nasdaq-100 (QQQ)", symbol: "QQQ" },
  { label: "Dow Jones (DIA)", symbol: "DIA" }
];

async function fetchQuote(symbol: string) {
  if (!marketApiKey) return null;
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "GLOBAL_QUOTE");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("apikey", marketApiKey);
  const res = await fetch(url.toString(), { cache: "no-store", headers: { "User-Agent": "StockSenseAI/1.0" } });
  if (!res.ok) return null;
  const data = await res.json();
  const parsed = parseAlphaVantageQuote(data);
  return parsed
    ? {
        symbol,
        price: parsed.price,
        change: parsed.change,
        changePercent: parsed.changePercent
      }
    : null;
}

async function fetchTopMovers(type: "gainers" | "losers") {
  if (!marketApiKey) return [];
  const url = new URL("https://www.alphavantage.co/query");
  url.searchParams.set("function", "TOP_GAINERS_LOSERS");
  url.searchParams.set("apikey", marketApiKey);
  const res = await fetch(url.toString(), { cache: "no-store", headers: { "User-Agent": "StockSenseAI/1.0" } });
  if (!res.ok) return [];
  const data = await res.json();
  const key = type === "gainers" ? "top_gainers" : "top_losers";
  const list = data?.[key];
  if (!Array.isArray(list)) return [];
  return list.slice(0, 5).map((item: any) => ({
    ticker: item.ticker,
    price: Number(item.price) || 0,
    change: Number(item.change_amount) || 0,
    changePercent: Number(item.change_percentage?.replace?.("%", "")) || 0
  }));
}

export async function GET() {
  if (!marketApiKey) {
    return NextResponse.json({ error: "Market data API key not configured." }, { status: 500 });
  }

  try {
    const [indexData, gainers, losers] = await Promise.all([
      Promise.all(INDEX_SYMBOLS.map((idx) => fetchQuote(idx.symbol))),
      fetchTopMovers("gainers"),
      fetchTopMovers("losers")
    ]);

    const indices = indexData
      .map((data, i) => (data ? { ...data, label: INDEX_SYMBOLS[i].label } : null))
      .filter(Boolean);

    let summary: string | null = null;
    if (openai) {
      const summaryPrompt = `
Summarize today's market in simple terms. Use concise, educational language.
Data:
- Indices: ${indices
        .map((i: any) => `${i.label}: $${i.price.toFixed(2)} (${i.changePercent.toFixed(2)}%)`)
        .join("; ")}
- Top gainers: ${gainers.map((g) => `${g.ticker} ${g.changePercent.toFixed(2)}%`).join(", ")}
- Top losers: ${losers.map((l) => `${l.ticker} ${l.changePercent.toFixed(2)}%`).join(", ")}

Constraints:
- No predictions or advice.
- Keep it short (3-4 sentences).
`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 160,
        messages: [{ role: "user", content: summaryPrompt }]
      });
      summary = completion.choices[0]?.message?.content?.trim() ?? null;
    }

    return NextResponse.json({
      indices,
      gainers,
      losers,
      summary
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

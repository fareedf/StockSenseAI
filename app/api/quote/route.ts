import { NextResponse } from "next/server";
import { parseAlphaVantageQuote } from "@/lib/quote";

const apiKey = process.env.MARKET_DATA_API_KEY;

export async function GET(req: Request) {
  if (!apiKey) {
    return NextResponse.json({ error: "Market data API key not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase().trim();

  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
  }

  try {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "GLOBAL_QUOTE");
    url.searchParams.set("symbol", ticker);
    url.searchParams.set("apikey", apiKey);

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "StockSenseAI/1.0" },
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Provider error (${res.status})`);
    }

    const data = await res.json();
    const quote = parseAlphaVantageQuote(data);

    if (!quote || !quote.price) {
      throw new Error("No data returned for that ticker.");
    }

    return NextResponse.json({ quote });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

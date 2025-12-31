import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServerClient } from "@/lib/supabase";

const marketApiKey = process.env.MARKET_DATA_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

export async function GET(req: Request) {
  if (!marketApiKey) {
    return NextResponse.json({ error: "Market data API key not configured." }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get("ticker")?.toUpperCase().trim();
  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
  }

  try {
    await supabaseServerClient.from("ticker_views").insert({ ticker });
  } catch (err) {
    console.error("ticker view insert failed", err);
  }

  try {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "OVERVIEW");
    url.searchParams.set("symbol", ticker);
    url.searchParams.set("apikey", marketApiKey);
    const res = await fetch(url.toString(), { cache: "no-store", headers: { "User-Agent": "StockSenseAI/1.0" } });
    if (!res.ok) {
      throw new Error(`Provider error (${res.status})`);
    }
    const data = await res.json();
    if (!data || Object.keys(data).length === 0 || data.Note) {
      throw new Error("No company data returned for that ticker.");
    }

    const overview = {
      name: data.Name || ticker,
      sector: data.Sector || "N/A",
      marketCap: data.MarketCapitalization || "N/A",
      description: data.Description || "No description available."
    };

    let simpleSummary: string | null = null;
    if (openai) {
      const summaryPrompt = `
Summarize what this company does in simple terms (2-3 sentences). Educational only, no investment advice.
Name: ${overview.name}
Sector: ${overview.sector}
Market cap: ${overview.marketCap}
Description: ${overview.description}
`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 140,
        messages: [{ role: "user", content: summaryPrompt }]
      });
      simpleSummary = completion.choices[0]?.message?.content?.trim() ?? null;
    }

    return NextResponse.json({ overview, summary: simpleSummary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

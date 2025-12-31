import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseServerClient } from "@/lib/supabase";
import { buildSystemPrompt } from "@/lib/prompt";
import { ChatMessage, Mode } from "@/lib/types";
import { parseAlphaVantageQuote } from "@/lib/quote";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const marketApiKey = process.env.MARKET_DATA_API_KEY;

const ALLOWED_MODES: Mode[] = ["beginner", "eli10", "analogy"];
const NAME_TO_TICKER: Record<string, string> = {
  MICROSOFT: "MSFT",
  APPLE: "AAPL",
  GOOGLE: "GOOGL",
  ALPHABET: "GOOGL",
  AMAZON: "AMZN",
  META: "META",
  FACEBOOK: "META",
  TESLA: "TSLA",
  NVIDIA: "NVDA",
  AMD: "AMD",
  INTEL: "INTC"
};

function normalizeMode(mode: string | null | undefined): Mode {
  if (!mode) return "beginner";
  return ALLOWED_MODES.includes(mode as Mode) ? (mode as Mode) : "beginner";
}

function detectTicker(text: string): string | null {
  const upper = text.toUpperCase();
  for (const [name, ticker] of Object.entries(NAME_TO_TICKER)) {
    if (upper.includes(name)) return ticker;
  }

  // Prefer $TICKER pattern
  const dollarMatch = text.match(/\$([A-Za-z]{1,5})\b/);
  if (dollarMatch) return dollarMatch[1].toUpperCase();

  // Otherwise, look for a probable ticker (1-5 uppercase letters) and avoid common words
  const candidates = upper
    .match(/\b[A-Z]{1,5}\b/g)
    ?.filter((w) => !["THE", "AND", "WHAT", "WITH", "ABOUT", "PRICE", "STOCK", "STOCKS", "ETF", "ETFS", "LIKE"].includes(w));

  return candidates && candidates.length > 0 ? candidates[0] : null;
}

async function fetchQuote(ticker: string) {
  if (!marketApiKey) return null;
  try {
    const url = new URL("https://www.alphavantage.co/query");
    url.searchParams.set("function", "GLOBAL_QUOTE");
    url.searchParams.set("symbol", ticker);
    url.searchParams.set("apikey", marketApiKey);

    const res = await fetch(url.toString(), { cache: "no-store", headers: { "User-Agent": "StockSenseAI/1.0" } });
    if (!res.ok) return null;
    const data = await res.json();
    const quote = parseAlphaVantageQuote(data);
    return quote;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabaseServerClient
    .from("messages")
    .select("id, role, content, mode, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }

  return NextResponse.json({ messages: data });
}

export async function POST(req: Request) {
  if (!openai) {
    return NextResponse.json({ error: "OpenAI is not configured." }, { status: 500 });
  }

  const body = await req.json();
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const mode = normalizeMode(body.mode);
  let conversationId = typeof body.conversationId === "string" ? body.conversationId : null;

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  try {
    if (!conversationId) {
      const { data: created, error: conversationError } = await supabaseServerClient
        .from("conversations")
        .insert({})
        .select("id")
        .single();
      if (conversationError || !created) {
        throw new Error("Could not start a new conversation.");
      }
      conversationId = created.id;
    }

    const userMessage: ChatMessage = { role: "user", content: message, mode };
    const { error: insertUserError } = await supabaseServerClient
      .from("messages")
      .insert({ ...userMessage, conversation_id: conversationId });

    if (insertUserError) {
      throw new Error("Failed to save your message.");
    }

    const { data: history, error: historyError } = await supabaseServerClient
      .from("messages")
      .select("role, content, mode")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (historyError) {
      throw new Error("Failed to load chat history.");
    }

    let marketContext: string | undefined;
    const ticker = detectTicker(message);
    if (ticker) {
      const quote = await fetchQuote(ticker);
      if (quote) {
        const dir = quote.change > 0 ? "up" : quote.change < 0 ? "down" : "flat";
        marketContext = `Market snapshot for ${quote.symbol} as of ${quote.latestTradingDay || "latest available"}:
- Price: $${quote.price.toFixed(2)}
- Change: $${quote.change.toFixed(2)} (${quote.changePercent.toFixed(2)}%, ${dir})
- Day range: $${quote.low.toFixed(2)} - $${quote.high.toFixed(2)}
- Previous close: $${quote.previousClose.toFixed(2)}
Use this data to add a brief Market Snapshot section. Educational only.`;
      }
    }

    const prompt = buildSystemPrompt(mode, marketContext);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 400,
      messages: [
        { role: "system", content: prompt },
        ...(history?.map((msg) => ({
          role: msg.role,
          content: msg.content
        })) || [])
      ]
    });

    const aiMessageText = completion.choices[0]?.message?.content?.trim() ?? "I had trouble generating a response.";

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: aiMessageText,
      mode
    };

    const { error: insertAssistantError } = await supabaseServerClient
      .from("messages")
      .insert({ ...assistantMessage, conversation_id: conversationId });

    if (insertAssistantError) {
      throw new Error("Failed to save AI response.");
    }

    const { data: fullHistory, error: fetchError } = await supabaseServerClient
      .from("messages")
      .select("id, role, content, mode, created_at, conversation_id")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw new Error("Failed to refresh messages.");
    }

    return NextResponse.json({
      conversationId,
      reply: aiMessageText,
      messages: fullHistory
    });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}

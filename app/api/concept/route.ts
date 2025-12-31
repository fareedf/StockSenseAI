import { NextResponse } from "next/server";
import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

const cache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

export async function POST(req: Request) {
  if (!openai) {
    return NextResponse.json({ error: "OpenAI not configured." }, { status: 500 });
  }

  const body = await req.json();
  const concept = typeof body.concept === "string" ? body.concept.trim() : "";
  if (!concept) {
    return NextResponse.json({ error: "Concept is required." }, { status: 400 });
  }

  const now = Date.now();
  const cached = cache.get(concept.toLowerCase());
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ content: cached.content, cached: true });
  }

  const prompt = `
Explain the following stock market concept in structured markdown.
Concept: ${concept}

Format:
1) Concept
2) Explanation
3) Example
4) Common Mistake

Constraints:
- Educational, concise, friendly.
- No financial advice or recommendations.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 320,
      messages: [{ role: "user", content: prompt }]
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? "Unable to generate right now.";
    cache.set(concept.toLowerCase(), { content, timestamp: now });

    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

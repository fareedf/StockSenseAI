import { NextResponse } from "next/server";

// History is disabled for the public demo to avoid storing/viewing user data.
export async function GET() {
  return NextResponse.json({
    messages: [],
    tickers: [],
    concepts: [],
    notice: "History disabled for demo."
  });
}

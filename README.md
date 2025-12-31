# StockSense AI

StockSense AI is a modern educational app that explains stock market concepts in clear language. It never gives financial advice or stock picks.

<img width="308" height="77" alt="image" src="https://github.com/user-attachments/assets/a27917a9-badd-43ca-adc0-a1684a596dd0" />

## Tech stack
- Next.js (App Router) + React
- Tailwind CSS + Framer Motion
- Supabase (PostgreSQL)
- OpenAI API
- Alpha Vantage (free quotes/overview)

## Getting started
1) Install deps: `npm install`
2) Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
   - `MARKET_DATA_API_KEY` (Alpha Vantage)
3) Apply `supabase/schema.sql` in Supabase SQL editor (conversations/messages).
4) Run: `npm run dev`

## App structure (pages)
- Navbar tabs: Chat, Market Overview, Concepts, Company Snapshot.
- `chat/` — chatbot + quote card; market snapshots when tickers appear in prompts. Chat data deletes on page exit.
- `market/` — SPY/QQQ/DIA proxies, top gainers/losers (Alpha Vantage), AI “today’s market” summary.
- `concepts/` — tap a concept to get structured explanation (Concept, Explanation, Example, Common Mistake) via OpenAI.
- `company/` — ticker input → Alpha Vantage overview + simple AI summary of what the company does.

## Key API routes
- `POST /api/chat` — chat with OpenAI + Supabase persistence; adds Market Snapshot when a ticker/company is detected.
- `GET /api/quote?ticker=MSFT` — Alpha Vantage Global Quote.
- `GET /api/market` — indices + gainers/losers + AI summary.
- `POST /api/concept` — OpenAI concept explainer (cached in-memory).
- `GET /api/company?ticker=MSFT` — company overview + AI summary.
- `POST /api/chat/delete` — deletes a conversation and its messages (used to clean up when leaving the page).

## System prompt highlights
- Teach stock market concepts only; no advice or picks.
- Structured sections: Concept, Simple Explanation, Example, Common Mistake (+ Market Snapshot when data is present).
- Modes: Beginner, Explain Like I’m 10, Analogy.

## Notes
- Alpha Vantage free tier is rate-limited; retry if you hit limits.
- Keep `.env.local` out of git; `.env.example` holds placeholders.

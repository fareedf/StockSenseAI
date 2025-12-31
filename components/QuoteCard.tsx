"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  previousClose: number;
  latestTradingDay: string;
};

export function QuoteCard() {
  const [ticker, setTicker] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchQuote(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setQuote(null);
    try {
      const res = await fetch(`/api/quote?ticker=${encodeURIComponent(ticker.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch quote.");
      }
      setQuote(data.quote);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch quote.");
    } finally {
      setLoading(false);
    }
  }

  const changeColor =
    quote && quote.change > 0
      ? "text-emerald-500"
      : quote && quote.change < 0
      ? "text-rose-500"
      : "text-slate-600";

  return (
    <motion.div
      className="soft-card p-6 md:p-7 space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-slate-900">Quick quote</p>
          <p className="text-sm text-slate-500">Live snapshot. Educational only, not trading advice.</p>
        </div>
        <div className="hidden sm:block text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-1">
          Alpha Vantage free tier
        </div>
      </div>
      <form onSubmit={fetchQuote} className="flex flex-col sm:flex-row gap-4 items-stretch">
        <input
          type="text"
          placeholder="Enter ticker (e.g., MSFT)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          className="flex-1 rounded-2xl bg-surface-subtle border border-slate-200 px-4 py-4 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/60 shadow-inner"
          disabled={loading}
        />
        <motion.button
          type="submit"
          className="rounded-2xl bg-accent text-white font-semibold px-6 py-3 shadow disabled:opacity-60 disabled:cursor-not-allowed transition self-stretch sm:self-auto"
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(142,246,197,0.35)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? "Fetching..." : "Get quote"}
        </motion.button>
      </form>
      {error ? <p className="text-sm text-rose-500">⚠️ {error}</p> : null}
      {quote ? (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <p className="text-slate-500">Symbol</p>
            <p className="text-slate-900 font-semibold">{quote.symbol}</p>
          </div>
          <div>
            <p className="text-slate-500">Price</p>
            <p className="text-slate-900 font-semibold">${quote.price.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Change</p>
            <p className={`font-semibold ${changeColor}`}>
              {quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
            </p>
          </div>
          <div>
            <p className="text-slate-500">Day High</p>
            <p className="text-slate-900 font-semibold">${quote.high.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Day Low</p>
            <p className="text-slate-900 font-semibold">${quote.low.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-slate-500">Prev Close</p>
            <p className="text-slate-900 font-semibold">${quote.previousClose.toFixed(2)}</p>
          </div>
          <div className="col-span-2 md:col-span-3">
            <p className="text-slate-500">Latest Trading Day</p>
            <p className="text-slate-900 font-semibold">{quote.latestTradingDay}</p>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}

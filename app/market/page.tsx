"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type IndexCard = {
  label: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
};

type Mover = {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
};

type MarketResponse = {
  indices: IndexCard[];
  gainers: Mover[];
  losers: Mover[];
  summary: string | null;
  error?: string;
};

export default function MarketPage() {
  const [data, setData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/market");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load market data");
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface-muted text-slate-800">
      <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Market Overview</h1>
          <p className="text-slate-600">Snapshot of major indices and today&apos;s movers. Educational only.</p>
        </div>

        {loading ? (
          <p className="text-slate-600">Loading market data...</p>
        ) : error ? (
          <p className="text-rose-500">⚠️ {error}</p>
        ) : data ? (
          <div className="space-y-5">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.indices?.map((idx) => {
                const positive = idx.change > 0;
                return (
                  <motion.div
                    key={idx.label}
                    className="soft-card p-4"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-slate-500 text-sm">{idx.label}</p>
                    <p className="text-xl font-semibold text-slate-900 mt-2">${idx.price.toFixed(2)}</p>
                    <p className={`text-sm ${positive ? "text-emerald-500" : idx.change < 0 ? "text-rose-500" : "text-slate-600"}`}>
                      {idx.change.toFixed(2)} ({idx.changePercent.toFixed(2)}%)
                    </p>
                  </motion.div>
                );
              })}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="soft-card p-4 space-y-3">
                <p className="text-sm text-slate-600 font-semibold">Top Gainers</p>
                <div className="space-y-2">
                  {data.gainers && data.gainers.length > 0 ? (
                    data.gainers.map((g) => (
                      <div key={g.ticker} className="flex items-center justify-between text-sm">
                        <span className="text-slate-900 font-semibold">{g.ticker}</span>
                        <span className="text-slate-600">${g.price.toFixed(2)}</span>
                        <span className="text-emerald-500 font-semibold">+{g.changePercent.toFixed(2)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No gainers data right now.</p>
                  )}
                </div>
              </div>
              <div className="soft-card p-4 space-y-3">
                <p className="text-sm text-slate-600 font-semibold">Top Losers</p>
                <div className="space-y-2">
                  {data.losers && data.losers.length > 0 ? (
                    data.losers.map((l) => (
                      <div key={l.ticker} className="flex items-center justify-between text-sm">
                        <span className="text-slate-900 font-semibold">{l.ticker}</span>
                        <span className="text-slate-600">${l.price.toFixed(2)}</span>
                        <span className="text-rose-500 font-semibold">{l.changePercent.toFixed(2)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">No losers data right now.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="soft-card p-5 space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Today&apos;s market in simple terms</p>
              <p className="text-slate-800 leading-relaxed">
                {data.summary ?? "No AI summary available at the moment. Please try again soon."}
              </p>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

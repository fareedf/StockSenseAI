"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CONCEPTS = [
  "Market capitalization",
  "Dividends",
  "Price-to-earnings ratio",
  "Index funds",
  "Exchange-traded funds (ETFs)",
  "Volatility",
  "Dollar-cost averaging",
  "Liquidity",
  "Bid-ask spread",
  "Short selling",
  "Limit order vs market order",
  "Blue-chip stocks"
];

export default function ConceptsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchConcept(name: string) {
    setSelected(name);
    setLoading(true);
    setError(null);
    setContent(null);
    try {
      const res = await fetch("/api/concept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: name })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load concept.");
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface-muted text-slate-800">
      <div className="max-w-6xl mx-auto px-5 py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Concepts Library</h1>
          <p className="text-slate-600">Tap a concept to get a structured, simple explanation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONCEPTS.map((item) => (
            <motion.button
              key={item}
              onClick={() => fetchConcept(item)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                selected === item ? "border-accent bg-white text-slate-900 shadow" : "border-slate-200 bg-white text-slate-700"
              }`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {item}
            </motion.button>
          ))}
        </div>

        <div className="soft-card p-5 min-h-[240px]">
          {loading ? (
            <p className="text-slate-600">Loading concept...</p>
          ) : error ? (
            <p className="text-rose-500">⚠️ {error}</p>
          ) : content ? (
            <div className="prose-structured space-y-2 text-slate-800" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br/>") }} />
          ) : (
            <p className="text-slate-500 text-sm">Select a concept to see the explanation.</p>
          )}
        </div>
      </div>
    </main>
  );
}

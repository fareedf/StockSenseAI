"use client";

"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type CompanyData = {
  name: string;
  sector: string;
  marketCap: string;
  description: string;
};

export default function CompanyPage() {
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState<{ overview: CompanyData; summary: string | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/company?ticker=${encodeURIComponent(ticker.trim())}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Unable to load company.");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface-muted text-slate-800">
      <div className="max-w-5xl mx-auto px-5 py-8 space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900">Company Snapshot</h1>
          <p className="text-slate-600">Enter a ticker to see the overview and a simple explanation.</p>
        </div>

        <form onSubmit={fetchCompany} className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 rounded-2xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/60"
            placeholder="Enter ticker (e.g., MSFT)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            disabled={loading}
          />
          <motion.button
            type="submit"
            className="rounded-2xl bg-accent text-white font-semibold px-5 py-3 shadow disabled:opacity-60 disabled:cursor-not-allowed transition"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? "Loading..." : "Get snapshot"}
          </motion.button>
        </form>

        <div className="soft-card p-5 space-y-3 min-h-[220px]">
          {loading ? (
            <p className="text-slate-600">Fetching company data...</p>
          ) : error ? (
            <p className="text-rose-500">⚠️ {error}</p>
          ) : data ? (
            <>
              <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold text-slate-900">{data.overview.name}</p>
                <p className="text-slate-600 text-sm">
                  Sector: {data.overview.sector} • Market Cap: {data.overview.marketCap}
                </p>
              </div>
              <p className="text-slate-800 text-sm leading-relaxed">{data.overview.description}</p>
              {data.summary ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">In simple terms</p>
                  <p className="text-slate-800 text-sm leading-relaxed">{data.summary}</p>
                </div>
              ) : null}
            </>
          ) : (
            <p className="text-slate-500 text-sm">Enter a ticker to load a snapshot.</p>
          )}
        </div>
      </div>
    </main>
  );
}

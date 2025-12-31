"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LogoBadge } from "./LogoBadge";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat" },
  { href: "/market", label: "Market Overview" },
  { href: "/concepts", label: "Concepts" },
  { href: "/company", label: "Company Snapshot" }
];

export function Navbar() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (pathname === "/" && href === "/chat") || pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md border-b border-slate-200 bg-white/90">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoBadge size="sm" />
          <div>
            <p className="text-sm font-semibold text-slate-900">StockSense AI</p>
            <p className="text-[12px] text-slate-500">Educational, not financial advice.</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm transition ${
                isActive(item.href)
                  ? "bg-slate-100 text-slate-900 border border-slate-200"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          className="md:hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur"
          >
            <div className="px-5 py-3 flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl text-sm ${
                    isActive(item.href) ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

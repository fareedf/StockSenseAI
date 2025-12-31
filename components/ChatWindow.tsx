"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageBubble } from "./MessageBubble";
import { ModeSelector } from "./ModeSelector";
import { TypingDots } from "./TypingDots";
import { ChatMessage, Mode } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

const LOCAL_STORAGE_KEY = "stocksense-conversation-id";
const EXAMPLE_PROMPTS = [
  "Explain dividends like I’m 10.",
  "What does market cap mean for $AAPL?",
  "How do ETFs differ from stocks?",
  "What is the P/E ratio and why does it matter?"
];

export function ChatWindow() {
  const [mode, setMode] = useState<Mode>("beginner");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const bannerText = useMemo(() => "Educational only. Not financial advice.", []);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setConversationId(stored);
      fetchHistory(stored);
    }
  }, []);

  useEffect(() => {
    const cleanup = () => {
      if (conversationId) {
        const payload = JSON.stringify({ conversationId });
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon("/api/chat/delete", blob);
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => {
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  async function fetchHistory(id: string) {
    try {
      setError(null);
      const res = await fetch(`/api/chat?conversationId=${id}`);
      if (!res.ok) {
        throw new Error("Unable to load chat history.");
      }
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      mode
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          conversationId
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "API error");
      }

      const data = await res.json();
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
        window.localStorage.setItem(LOCAL_STORAGE_KEY, data.conversationId);
      }
      setMessages(data.messages ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  function handlePromptClick(prompt: string) {
    setInput(prompt);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-6">
      <motion.div
        className="flex flex-col gap-4 p-6 rounded-3xl border border-slate-200 bg-white shadow-card"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-slate-900">StockSense AI</p>
            <p className="text-sm text-slate-500">{bannerText}</p>
          </div>
          <ModeSelector value={mode} onChange={setMode} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(34,197,94,0.25)]" />
            <p>Live AI explanations with structured sections.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_6px_rgba(59,130,246,0.2)]" />
            <p>Market Snapshot added when you mention a ticker.</p>
          </div>
        </div>
      </motion.div>

      <div className="soft-card h-[78vh] md:h-[80vh] flex flex-col overflow-hidden relative">
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 p-6">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4">
              <div className="max-w-2xl text-center space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">Ask about any stock market concept.</h2>
                <p className="text-slate-500">
                  Try "What is market capitalization?" or "Explain dividends like I’m 10." Mention a ticker (e.g., $MSFT) for a market snapshot.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-2xl border border-slate-200 bg-surface-subtle px-4 py-3 text-sm text-left text-slate-800 hover:border-accent/60 hover:-translate-y-0.5 transition shadow-sm"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((message, idx) => (
                <MessageBubble key={message.id ?? idx} message={message} />
              ))}
              {isLoading ? (
                <motion.div
                  key="typing"
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                    <TypingDots />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          )}
        </div>
        {error ? (
          <div className="px-6 pb-2 text-sm text-rose-500 flex items-center gap-2">⚠️ {error}</div>
        ) : null}
        <form onSubmit={handleSend} className="p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-card p-3 flex flex-col gap-3">
            <textarea
              className="w-full rounded-xl bg-surface-subtle border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/60 resize-none transition shadow-inner"
              rows={3}
              placeholder="Ask a stock market question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500">Enter to send. Educational only. Not financial advice.</p>
              <motion.button
                type="submit"
                className="rounded-xl bg-accent text-white font-semibold px-5 py-2 shadow disabled:opacity-60 disabled:cursor-not-allowed transition"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(142,246,197,0.35)" }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? "Thinking..." : "Send"}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

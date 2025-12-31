"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { QuoteCard } from "@/components/QuoteCard";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-surface via-surface-subtle to-surface-muted text-slate-800">
      <div className="pt-6 pb-14">
        <div className="max-w-5xl mx-auto px-5 space-y-6">
          <div className="max-w-3xl mx-auto">
            <QuoteCard />
          </div>
          <ChatWindow />
        </div>
      </div>
    </main>
  );
}

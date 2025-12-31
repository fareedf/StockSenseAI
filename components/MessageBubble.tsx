import { ChatMessage, MODE_LABELS } from "@/lib/types";
import { motion } from "framer-motion";

type Props = {
  message: ChatMessage;
};

export function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div
        className={`max-w-3xl rounded-3xl px-5 py-4 shadow ${
          isUser
            ? "bg-accent text-white font-semibold shadow-lg"
            : "bg-white border border-slate-200 text-slate-800"
        }`}
      >
        <div className={`whitespace-pre-wrap leading-relaxed ${!isUser ? "prose-structured" : ""}`}>
          {message.content}
        </div>
        <div className="text-[11px] text-slate-500 mt-3 flex items-center gap-2 uppercase tracking-wide">
          <span>{MODE_LABELS[message.mode]}</span>
          {message.created_at ? (
            <span className="text-slate-500">• {new Date(message.created_at).toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

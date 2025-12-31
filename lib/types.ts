export type Mode = "beginner" | "eli10" | "analogy";

export const MODE_LABELS: Record<Mode, string> = {
  beginner: "Beginner",
  eli10: "Explain Like I'm 10",
  analogy: "Analogy Mode"
};

export type ChatMessage = {
  id?: string;
  conversation_id?: string;
  role: "user" | "assistant";
  content: string;
  mode: Mode;
  created_at?: string;
};

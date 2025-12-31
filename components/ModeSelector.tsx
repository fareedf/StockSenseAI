import { MODE_LABELS, Mode } from "@/lib/types";
import { motion } from "framer-motion";

type Props = {
  value: Mode;
  onChange: (mode: Mode) => void;
};

const MODES: Mode[] = ["beginner", "eli10", "analogy"];

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Explanation mode</span>
      <div className="bg-white border border-slate-200 rounded-full p-1 flex gap-1 shadow-inner">
        {MODES.map((mode) => {
          const isActive = value === mode;
          return (
            <motion.button
              key={mode}
              onClick={() => onChange(mode)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-accent text-white shadow" : "text-slate-700 hover:bg-slate-100"
              }`}
              type="button"
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
            >
              {MODE_LABELS[mode]}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

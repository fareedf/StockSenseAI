"use client";

import { motion } from "framer-motion";

type Props = {
  size?: "sm" | "md";
};

export function LogoBadge({ size = "md" }: Props) {
  const dimension = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const eyeSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const blinkVariants = {
    animate: {
      scaleY: [1, 0.2, 1],
      transition: { duration: 0.18, repeat: Infinity, repeatDelay: 3.2, ease: "easeInOut" }
    }
  };

  return (
    <div
      className={`${dimension} rounded-2xl bg-gradient-to-br from-green-400 to-sky-400 border border-slate-200 flex items-center justify-center shadow-lg`}
    >
      <div className="relative h-full w-full flex flex-col items-center justify-center gap-1">
        <div className="flex items-center justify-center gap-2">
          <motion.span
            className={`${eyeSize} rounded-full bg-white/90 border border-white/50 shadow`}
            variants={blinkVariants}
            animate="animate"
          />
          <motion.span
            className={`${eyeSize} rounded-full bg-white/90 border border-white/50 shadow`}
            variants={blinkVariants}
            animate="animate"
            transition={{ delay: 0.08 }}
          />
        </div>
        <div className="h-[6px] w-8 rounded-b-xl bg-white/90 border border-white/60 shadow-inner" />
      </div>
    </div>
  );
}

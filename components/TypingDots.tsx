import { motion } from "framer-motion";

export function TypingDots() {
  const dotVariants = {
    animate: {
      y: [0, -4, 0],
      transition: {
        duration: 0.9,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-slate-200/80"
          variants={dotVariants}
          animate="animate"
          transition={{ delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

// src/components/AnimatedPage.jsx
import { motion } from "framer-motion";

export default function AnimatedPage({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
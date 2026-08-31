// src/components/ThemeToggle.jsx

import { FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-yellow-300 shadow-md hover:shadow-lg transition-shadow"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <FaMoon size={18} /> : <FaSun size={18} />}
    </button>
  );
}
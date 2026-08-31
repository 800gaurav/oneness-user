import { useState } from "react";
import { motion } from "framer-motion";
import { FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import SubscriptionStatus from "../ui/SubscriptionStatus";

export default function Navbar({ userRole }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { isDark } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 ml-12 md:ml-0">
          <h1 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
            Material Supply CRM
          </h1>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white sm:hidden">
            CRM
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {user?.role !== 'superadmin' && <SubscriptionStatus />}
          <ThemeToggle />
          
          <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FiBell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiUser size={20} />
              <span className="hidden md:block text-sm font-medium">
                {user?.name || 'User'}
              </span>
            </button>

            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
              >
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiUser className="mr-3" size={16} />
                  Profile
                </a>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiLogOut className="mr-3" size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
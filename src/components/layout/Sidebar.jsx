import { useState } from "react";
import { motion } from "framer-motion";
import { FiMenu, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Building } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Sidebar({ userRole }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const sidebarWidth = isCollapsed ? 72 : 240;

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <FiX size={24} className="text-gray-600 dark:text-gray-300" /> : <FiMenu size={24} className="text-gray-600 dark:text-gray-300" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <motion.aside
        animate={{
          width: sidebarWidth,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`fixed md:relative top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-2xl 
                   z-40 flex flex-col border-r border-gray-200 dark:border-gray-800 overflow-hidden transition-transform duration-300
                   ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{ width: mobileOpen ? '280px' : sidebarWidth }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          {(!isCollapsed || mobileOpen) && (
            <h2
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent cursor-pointer flex items-center"
              onClick={() => navigate("/dashboard")}
            >
              <Building className="mr-2 text-indigo-600" size={24} />
              MaterialCRM
            </h2>
          )}
          {!mobileOpen && (
            <button
              onClick={handleToggleCollapse}
              className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <FiChevronRight className="text-gray-600 dark:text-gray-400" size={20} />
              ) : (
                <FiChevronLeft className="text-gray-600 dark:text-gray-400" size={20} />
              )}
            </button>
          )}
        </div>


      </motion.aside>
    </>
  );
}
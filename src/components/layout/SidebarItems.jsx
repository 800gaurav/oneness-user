import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiUser,
  FiTruck,
  FiUserCheck,
  FiUserPlus,
  FiLayers,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarItems({ userRole, onItemClick, isCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Super Admin Menu
  const adminMenuItems = [
    { name: "Dashboard", icon: <FiHome size={20} />, path: "/dashboard" },
    { name: "User Management", icon: <FiUserPlus size={20} />, path: "/dashboard/users" },
    { name: "User Status", icon: <FiUserCheck size={20} />, path: "/dashboard/user-status" },
    { name: "Plan Management", icon: <FiLayers size={20} />, path: "/dashboard/plans" },
    { name: "Reports", icon: <FiBarChart2 size={20} />, path: "/dashboard/reports" },
    { name: "Settings", icon: <FiSettings size={20} />, path: "/dashboard/settings" },
  ];

  // Client Menu
  const clientMenuItems = [
    { name: "Dashboard", icon: <FiHome size={20} />, path: "/dashboard" },
    { name: "Suppliers", icon: <FiTruck size={20} />, path: "/dashboard/suppliers" },
    { name: "Supplier Purchases", icon: <FiShoppingBag size={20} />, path: "/dashboard/supplier-purchases" },
    { name: "Supplier Payments", icon: <FiCreditCard size={20} />, path: "/dashboard/supplier-payments" },
    { name: "Purchases", icon: <FiShoppingBag size={20} />, path: "/dashboard/purchases" },
    { name: "Customers", icon: <FiUsers size={20} />, path: "/dashboard/customers" },
    { name: "Customer Sales", icon: <FiTrendingUp size={20} />, path: "/dashboard/customer-sales" },
    { name: "Customer Payments", icon: <FaRupeeSign size={20} />, path: "/dashboard/customer-payments" },
    { name: "Materials", icon: <FiPackage size={20} />, path: "/dashboard/materials" },
    { name: "Orders", icon: <FiShoppingCart size={20} />, path: "/dashboard/orders" },
    { name: "Payments", icon: <FiCreditCard size={20} />, path: "/dashboard/payments" },
    // { name: "Expenses", icon: <FaRupeeSign size={20} />, path: "/dashboard/expenses" },
    { name: "Transactions", icon: <FiTrendingUp size={20} />, path: "/dashboard/transactions" },
    { name: "Staff Management", icon: <FiUsers size={20} />, path: "/dashboard/staff" },
    { name: "Reports", icon: <FiBarChart2 size={20} />, path: "/dashboard/reports" },
    { name: "Profile", icon: <FiUser size={20} />, path: "/dashboard/profile" },
    { name: "Settings", icon: <FiSettings size={20} />, path: "/dashboard/settings" },
  ];

  const menuItems = userRole === 'superadmin' ? adminMenuItems : clientMenuItems;

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      onItemClick?.();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="flex-1 p-3 overflow-y-auto">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.path);

          return (
            <li key={item.name}>
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative
                  ${active
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-indigo-600"
                  }
                  ${isCollapsed ? "justify-center" : "justify-start"}`}
                title={isCollapsed ? item.name : ""}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {!isCollapsed && <span className="font-medium">{item.name}</span>}
                </div>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

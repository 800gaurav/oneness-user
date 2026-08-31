import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import AnimatedPage from '../../../components/ui/AnimatedPage';
import Navbar from '../../../components/layout/Navbar';
import Sidebar from '../../../components/layout/Sidebar';

// Client Pages
import Dashboard from '../../dashboard/Dashboard';
import Suppliers from '../../suppliers/Suppliers';
import Customers from '../../customers/Customers';
import CustomerSales from '../../customers/CustomerSales';
import CustomerPayments from '../../customers/CustomerPayments';
import SupplierPurchases from '../../suppliers/SupplierPurchases';
import SupplierPayments from '../../suppliers/SupplierPayments';
import Transactions from '../../transactions/Transactions';
import StaffManagement from '../../staff/StaffManagement';
import StaffPayments from '../../staff/StaffPayments';
import Materials from '../../materials/Materials';
import Orders from '../../orders/Orders';
import Payments from '../../payments/Payments';

import Reports from '../../reports/Reports';
import Purchases from '../../purchases/Purchases';

// Admin Pages
import AdminDashboard from '../../admin/AdminDashboard';
import ClientManagement from '../../admin/ClientManagement';
import UserStatusManagement from '../../admin/UserStatusManagement';
import PlanManagement from '../../admin/PlanManagement';

// Settings Pages
import Settings from '../../settings/Settings';

export default function UserDashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const isAdmin = user?.role === 'superadmin';

  return (
    <AnimatedPage>
      <div className={`flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900 ${isDark ? 'dark' : ''}`}>
        <Sidebar userRole={user?.role} />
        <div className="flex-1">
          <Navbar userRole={user?.role} />
          <main className="p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
            <Routes>
              {isAdmin ? (
                // Super Admin Routes
                <>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/users" element={<ClientManagement />} />
                  <Route path="/user-status" element={<UserStatusManagement />} />
                  <Route path="/plans" element={<PlanManagement />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Admin Settings</div>} />
                </>
              ) : (
                // Client Routes
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/suppliers" element={<Suppliers />} />
                  <Route path="/supplier-purchases" element={<SupplierPurchases />} />
                  <Route path="/supplier-purchases/:supplierId" element={<SupplierPurchases />} />
                  <Route path="/supplier-payments" element={<SupplierPayments />} />
                  <Route path="/supplier-payments/:supplierId" element={<SupplierPayments />} />
                  <Route path="/purchases" element={<Purchases />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customer-sales" element={<CustomerSales />} />
                  <Route path="/customer-sales/:customerId" element={<CustomerSales />} />
                  <Route path="/customer-payments" element={<CustomerPayments />} />
                  <Route path="/customer-payments/:customerId" element={<CustomerPayments />} />
                  <Route path="/materials" element={<Materials />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/payments" element={<Payments />} />
                 
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/staff" element={<StaffManagement />} />
                  <Route path="/staff-payments" element={<StaffPayments />} />
                  <Route path="/staff-payments/:staffId" element={<StaffPayments />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/profile" element={<div className="text-2xl font-bold text-gray-800 dark:text-white">Profile Page</div>} />
                  <Route path="/settings" element={<Settings />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}
import { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, Bell, FileText, Settings, Plus, Menu, X, Cake, LogOut, Package, IndianRupee, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Dashboard from './Dashboard';
import Customers from './Customers';
import Campaigns from './Campaigns';
import Reminders from './Reminders';
import Products from './Products';
import StoreOrders from './StoreOrders';
import SettingsPage from './SettingsPage';
import BillsHistory from './BillsHistory';

const BakeryDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [openAddCustomerSignal, setOpenAddCustomerSignal] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const { data } = await api.get('/store-orders');
      setPendingOrderCount((data || []).filter(order => order.status === 'pending').length);
    } catch (error) {
      console.error('Failed to fetch pending orders', error);
      setPendingOrderCount(0);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const openAddCustomer = () => {
    setOpenAddCustomerSignal(signal => signal + 1);
    navigate('/admin/customers');
  };

  const openBillGenerator = () => {
    navigate('/admin/bills?new=1');
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Customers', icon: Users, path: '/admin/customers' },
    { name: 'Products', icon: Package, path: '/admin/products' },
    { name: 'Store Orders', icon: Store, path: '/admin/store-orders' },
    { name: 'Bills', icon: FileText, path: '/admin/bills' },
    { name: 'Campaigns', icon: Megaphone, path: '/admin/campaigns' },
    { name: 'Reminders', icon: Bell, path: '/admin/reminders' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--color-surface))]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(160deg, #3d2010 0%, #5c3a21 60%, #7a4f2e 100%)' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.25)', border: '1px solid rgba(212,175,55,0.4)' }}>
                <Cake className="w-4 h-4" style={{ color: '#d4af37' }} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">BakeryCRM</h1>
                <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Marketing Suite</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm"
                  style={isActive
                    ? { background: 'rgba(212,175,55,0.2)', color: '#d4af37', borderLeft: '3px solid #d4af37' }
                    : { color: 'white', borderLeft: '3px solid transparent' }
                  }
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all"
              style={{ color: 'rgba(255,120,120,0.85)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-56">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-[rgb(var(--color-border))] shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 lg:px-6">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1">
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={openAddCustomer}
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[rgb(var(--color-brown))] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[rgb(var(--color-light-brown))]"
              >
                <Plus className="w-3.5 h-3.5" />
                New Customer
              </button>
              <button
                onClick={openBillGenerator}
                className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-1.5 text-xs font-semibold text-[rgb(var(--color-brown))] shadow-sm hover:bg-[rgb(var(--color-surface))]"
              >
                <IndianRupee className="w-3.5 h-3.5" />
                Make Bill
              </button>
              <button
                onClick={() => navigate('/admin/store-orders')}
                className="relative p-1.5 hover:bg-[rgb(var(--color-surface))] rounded-lg transition-colors"
                title={`${pendingOrderCount} pending orders`}
              >
                <Bell className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />
                {pendingOrderCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {pendingOrderCount > 99 ? '99+' : pendingOrderCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-[rgb(var(--color-surface))] rounded-lg cursor-pointer transition-colors">
                <div className="w-7 h-7 bg-gradient-to-br from-[rgb(var(--color-pink))] to-[rgb(var(--color-accent))] rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-[rgb(var(--color-brown))]">{user?.name?.charAt(0) || 'B'}</span>
                </div>
                <span className="hidden sm:inline text-xs font-medium text-[rgb(var(--color-text-primary))]">{user?.name || 'Bakery Owner'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="customers" element={<Customers openAddSignal={openAddCustomerSignal} />} />
            <Route path="products" element={<Products />} />
            <Route path="store-orders" element={<StoreOrders />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="campaigns/create" element={<Campaigns />} />
            <Route path="campaigns/edit/:id" element={<Campaigns />} />
            <Route path="reminders" element={<Reminders />} />
            <Route path="bills" element={<BillsHistory />} />
            <Route path="settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default BakeryDashboard;

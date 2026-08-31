import { useEffect, useState } from 'react';
import { ArrowUpRight, Cake, CheckCircle2, ExternalLink, IndianRupee, Package, Truck, Users, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { customerAPI } from '../../services/api';
import WhatsAppStatusBanner from '../../components/layout/WhatsAppStatusBanner';

const money = (v = 0) => `₹${Number(v || 0).toLocaleString('en-IN')}`;

const Dashboard = () => {
  const [orders, setOrders]       = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [o, c] = await Promise.all([
          api.get('/store-orders'),
          customerAPI.getAll({ filterDate: 'all' })
        ]);
        setOrders(o.data || []);
        setCustomers(c.data || []);
      } catch {
        setOrders([]); setCustomers([]);
      }
    };
    fetchData();
  }, []);

  const today             = new Date();
  const todaysOrders      = orders.filter(o => new Date(o.createdAt).toDateString() === today.toDateString());
  const pendingOrders     = orders.filter(o => o.status === 'pending');
  const preparingOrders   = orders.filter(o => o.status === 'preparing');
  const outForDelivery    = orders.filter(o => o.status === 'out_for_delivery');
  const unpaidOrders      = orders.filter(o => (o.paymentStatus || 'unpaid') !== 'paid');
  const todayBirthdays    = customers.filter(c => {
    if (!c.birthday) return false;
    const b = new Date(c.birthday);
    return b.getMonth() === today.getMonth() && b.getDate() === today.getDate();
  });
  const revenueToday = todaysOrders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);
  const totalSales   = orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  const stats = [
    { label: 'Pending Orders',    value: pendingOrders.length,   subValue: 'Need action',       icon: Package,     color: 'from-yellow-500 to-yellow-600',  path: '/dashboard/store-orders' },
    { label: 'Preparing',         value: preparingOrders.length, subValue: 'Accepted orders',   icon: CheckCircle2,color: 'from-purple-500 to-purple-600',  path: '/dashboard/store-orders' },
    { label: 'Out for Delivery',  value: outForDelivery.length,  subValue: 'On the way',        icon: Truck,       color: 'from-blue-500 to-blue-600',      path: '/dashboard/store-orders' },
    { label: 'Today Sales',       value: money(revenueToday),    subValue: `${todaysOrders.length} orders today`, icon: IndianRupee, color: 'from-green-500 to-green-600', path: '/dashboard/store-orders' },
    { label: 'Unpaid Payments',   value: unpaidOrders.length,    subValue: 'Collect or update', icon: WalletCards, color: 'from-red-500 to-red-600',        path: '/dashboard/store-orders' },
    { label: "Today's Birthdays", value: todayBirthdays.length,  subValue: `${customers.length} customers`, icon: Cake, color: 'from-pink-500 to-pink-600', path: '/dashboard/customers' },
    { label: 'Total Sales',       value: money(totalSales),      subValue: `${orders.length} total orders`, icon: IndianRupee, color: 'from-emerald-500 to-emerald-600', path: '/dashboard/store-orders' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--color-brown))]">Dashboard</h1>
          <p className="mt-0.5 text-sm text-[rgb(var(--color-text-secondary))]">Live store orders, payments and customer reminders.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-lg border border-[rgb(var(--color-border))] bg-white px-3 py-1.5 md:flex">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-[rgb(var(--color-text-secondary))]">Live</span>
          </div>
          <a href="/store" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600">
            <ExternalLink className="h-4 w-4" /> View Store
          </a>
        </div>
      </div>

      <WhatsAppStatusBanner />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.path} className="group rounded-xl border border-[rgb(var(--color-border))] bg-white p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1 text-xs text-[rgb(var(--color-text-secondary))]">{stat.label}</p>
                <h3 className="mb-0.5 text-2xl font-bold text-[rgb(var(--color-text-primary))]">{stat.value}</h3>
                <p className="mb-1 text-[10px] text-[rgb(var(--color-text-tertiary))]">{stat.subValue}</p>
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <p className="text-xs font-medium text-green-600">Open</p>
                </div>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

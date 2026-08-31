import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Building, IndianRupee, TrendingUp, Crown, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminStatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    yellow: 'bg-yellow-500 text-white',
    red: 'bg-red-500 text-white',
    purple: 'bg-purple-500 text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <TrendingUp className="text-green-500" size={16} />
              <span className="text-sm ml-1 text-green-500">{change}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminStats = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.totalUsers || '0',
      change: dashboardData.userGrowth || '+0%',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Active Users',
      value: dashboardData.activeUsers || '0',
      change: dashboardData.activeGrowth || '+0%',
      icon: Crown,
      color: 'green',
    },
    {
      title: 'Total Revenue',
      value: `₹${dashboardData.totalRevenue || '0'}`,
      change: dashboardData.revenueGrowth || '+0%',
      icon: IndianRupee,
      color: 'purple',
    },
    {
      title: 'New Registrations',
      value: dashboardData.newRegistrations || '0',
      change: dashboardData.registrationGrowth || '+0%',
      icon: AlertCircle,
      color: 'red',
    },
  ] : [];

  const subscriptionData = dashboardData?.subscriptionData || [
    { name: 'Basic', value: 0, color: '#0088FE' },
    { name: 'Premium', value: 0, color: '#00C49F' },
    { name: 'Enterprise', value: 0, color: '#FFBB28' },
  ];

  const revenueData = dashboardData?.revenueData || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Crown className="mr-2 text-purple-600" size={28} />
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Material Supply CRM - SaaS Management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminStats.map((stat, index) => (
          <AdminStatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Revenue & Client Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => 
                name === 'revenue' ? `₹${value.toLocaleString()}` : value
              } />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" />
              <Bar dataKey="clients" fill="#10B981" name="Clients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subscription Plans</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Client Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Recent Clients</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'ABC Construction Ltd', plan: 'Enterprise', status: 'Active', revenue: '₹15,000/mo' },
                { name: 'XYZ Builders', plan: 'Premium', status: 'Active', revenue: '₹8,000/mo' },
                { name: 'DEF Projects', plan: 'Basic', status: 'Trial', revenue: '₹3,000/mo' },
                { name: 'GHI Contractors', plan: 'Premium', status: 'Active', revenue: '₹8,000/mo' },
              ].map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.plan} Plan</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-purple-600">{client.revenue}</div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">System Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { metric: 'Server Uptime', value: '99.9%', status: 'good' },
                { metric: 'Database Performance', value: '95%', status: 'good' },
                { metric: 'API Response Time', value: '120ms', status: 'good' },
                { metric: 'Storage Usage', value: '67%', status: 'warning' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{item.metric}</div>
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{item.value}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      item.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;

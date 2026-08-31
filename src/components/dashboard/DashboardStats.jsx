import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, IndianRupee, Users, Package, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, change, changeType, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <div className="flex items-center mt-3">
              {changeType === 'increase' ? (
                <TrendingUp className="text-green-500" size={16} />
              ) : (
                <TrendingDown className="text-red-500" size={16} />
              )}
              <span className={`text-sm ml-2 font-medium ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                {change} from last month
              </span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
          <Icon size={28} className="text-white" />
        </div>
      </div>
    </motion.div>
  );
};

const DashboardStats = ({ stats }) => {
  const data = stats || {};

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${data.revenue?.total?.toLocaleString() || 0}`,
      change: `₹${data.revenue?.thisMonth?.toLocaleString() || 0} this month`,
      changeType: 'increase',
      icon: IndianRupee,
      color: 'green',
    },
    {
      title: 'Total Expenses',
      value: `₹${data.expenses?.total?.toLocaleString() || 0}`,
      change: `₹${data.expenses?.thisMonth?.toLocaleString() || 0} this month`,
      changeType: 'increase',
      icon: IndianRupee,
      color: 'red',
    },
    {
      title: 'Net Profit',
      value: `₹${data.profit?.total?.toLocaleString() || 0}`,
      change: `₹${data.profit?.thisMonth?.toLocaleString() || 0} this month`,
      changeType: data.profit?.total >= 0 ? 'increase' : 'decrease',
      icon: TrendingUp,
      color: data.profit?.total >= 0 ? 'green' : 'red',
    },
    {
      title: 'Pending Receivables',
      value: `₹${data.pendingReceivables?.totalReceivable?.toLocaleString() || 0}`,
      change: `${data.pendingReceivables?.count || 0} orders`,
      changeType: 'increase',
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Pending Payables',
      value: `₹${data.pendingPayables?.totalPayable?.toLocaleString() || 0}`,
      change: `${data.pendingPayables?.count || 0} orders`,
      changeType: 'increase',
      icon: AlertCircle,
      color: 'yellow',
    },
    {
      title: 'Low Stock Items',
      value: data.lowStockMaterials || 0,
      change: 'Items need reorder',
      icon: Package,
      color: 'red',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardStats;

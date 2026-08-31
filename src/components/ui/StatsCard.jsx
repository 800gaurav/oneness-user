import { motion } from 'framer-motion';

const StatsCard = ({ title, value, color = 'blue', icon: Icon, delay = 0 }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className={`text-2xl font-bold ${colorClasses[color]}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20`}>
            <Icon className={colorClasses[color]} size={24} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
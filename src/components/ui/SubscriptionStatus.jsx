import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

const SubscriptionStatus = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await authAPI.getSubscription();
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !subscription) return null;

  const getStatusColor = () => {
    if (subscription.isExpired) return 'text-red-600 dark:text-red-400';
    if (subscription.daysRemaining <= 7) return 'text-orange-600 dark:text-orange-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (subscription.isExpired) return <AlertTriangle size={16} />;
    if (subscription.daysRemaining <= 7) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 border-indigo-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {subscription.plan}
          </h3>
          <div className={`flex items-center gap-1 text-sm ${getStatusColor()}`}>
            {getStatusIcon()}
            <span>
              {subscription.isExpired 
                ? 'Expired' 
                : `${subscription.daysRemaining} days remaining`
              }
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar size={12} />
            <span>Expires: {new Date(subscription.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatus;
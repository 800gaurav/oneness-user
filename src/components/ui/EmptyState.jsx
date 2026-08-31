import { Search } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = Search, 
  title = "No results found", 
  description = "No items found matching your criteria",
  actionText = "Clear filters",
  onAction,
  className = ""
}) => {
  return (
    <div className={`text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="text-gray-500 dark:text-gray-400">
        <Icon size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">{description}</p>
        {onAction && (
          <button
            onClick={onAction}
            className="mt-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
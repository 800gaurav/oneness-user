import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const FilterPanel = ({ 
  searchTerm, 
  onSearchChange, 
  showFilters, 
  onToggleFilters, 
  onClearFilters,
  children,
  searchPlaceholder = "Search..."
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter size={20} className="mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {children}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={16} className="mr-2" />
                Clear
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FilterPanel;
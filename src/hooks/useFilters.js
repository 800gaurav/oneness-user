import { useState, useMemo } from 'react';

export const useFilters = (data, filterConfig) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(filterConfig.initialFilters || {});
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = !searchTerm || 
        filterConfig.searchFields.some(field => {
          const value = field.split('.').reduce((obj, key) => obj?.[key], item);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });

      // Custom filters
      const matchesFilters = Object.entries(filters).every(([key, value]) => {
        if (!value || (Array.isArray(value) && value.length === 0)) return true;
        
        const filterFn = filterConfig.filterFunctions[key];
        return filterFn ? filterFn(item, value) : true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [data, searchTerm, filters, filterConfig]);

  const clearFilters = () => {
    setFilters(filterConfig.initialFilters || {});
    setSearchTerm('');
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    filteredData,
    clearFilters,
    updateFilter
  };
};

export default useFilters;
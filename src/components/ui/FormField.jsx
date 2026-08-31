const FormField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  placeholder = '', 
  options = [],
  className = '',
  ...props 
}) => {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-colors";

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <select
            value={value}
            onChange={onChange}
            className={`${baseClasses} ${className}`}
            required={required}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClasses} ${className}`}
            required={required}
            {...props}
          />
        );
      default:
        return (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`${baseClasses} ${className}`}
            required={required}
            {...props}
          />
        );
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label} {required && '*'}
        </label>
      )}
      {renderInput()}
    </div>
  );
};

export default FormField;
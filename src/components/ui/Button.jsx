import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4';
  
  const variants = {
    primary: 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:ring-indigo-500/50',
    secondary: 'bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 focus:ring-purple-500/50',
    outline: 'border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white focus:ring-indigo-500/50',
    ghost: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 focus:ring-indigo-500/50'
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
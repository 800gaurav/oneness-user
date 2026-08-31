import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  variant = 'default',
  ...props 
}) => {
  const variants = {
    default: 'bg-surface border-border',
    elevated: 'bg-surface border-border shadow-xl',
    filled: 'bg-surface-dark border-border'
  };

  return (
    <div 
      className={`rounded-2xl border ${variants[variant]} p-6 transition-all duration-300 hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
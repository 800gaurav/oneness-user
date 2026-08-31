import React from 'react';
import Card from './Card';

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className = '' 
}) => {
  return (
    <Card variant="elevated" className={`text-center group hover:transform hover:-translate-y-2 ${className}`}>
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </Card>
  );
};

export default FeatureCard;
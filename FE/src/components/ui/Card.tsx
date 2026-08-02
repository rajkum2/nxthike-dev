import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = false,
}) => {
  const baseClasses = 'bg-white rounded-lg border border-surface-200 overflow-hidden';
  const hoverClasses = hoverable
    ? 'transition-shadow duration-300 hover:shadow-md cursor-pointer'
    : '';
  const paddingClass = padding ? 'p-5' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${paddingClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-5 py-4 border-b border-surface-100 ${className}`}>
      {children}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-5 py-4 border-t border-surface-100 bg-surface-50/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  className = '' 
}) => {
  const variants = {
    success: 'bg-vax-success-light text-vax-success',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-vax-error-light text-vax-error',
    info: 'bg-vax-primary/5 text-vax-primary',
    neutral: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

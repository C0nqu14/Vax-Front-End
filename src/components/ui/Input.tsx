import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="text-sm font-medium text-vax-primary block">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-vax-primary transition-colors">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              bg-vax-input border border-vax-border rounded-vax px-4 py-2.5 text-vax-primary 
              focus:outline-none focus:ring-2 focus:ring-vax-primary/10 focus:border-vax-primary 
              transition-all w-full placeholder:text-slate-400
              ${leftIcon ? 'pl-11' : ''}
              ${rightIcon ? 'pr-11' : ''}
              ${error ? 'border-vax-error-DEFAULT ring-vax-error-DEFAULT/10' : ''}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-vax-error-DEFAULT flex items-center gap-1 mt-1">
            <span className="w-1 h-1 rounded-full bg-vax-error-DEFAULT" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

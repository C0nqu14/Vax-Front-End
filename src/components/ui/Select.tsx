import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, leftIcon, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="text-sm font-medium text-vax-primary block">
            {label}
          </label>
        )}
        <div className="relative group">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-vax-primary transition-colors pointer-events-none">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={`
              bg-vax-input border border-vax-border rounded-vax px-4 py-2.5 text-vax-primary 
              focus:outline-none focus:ring-2 focus:ring-vax-primary/10 focus:border-vax-primary 
              transition-all w-full appearance-none cursor-pointer
              ${leftIcon ? 'pl-11' : ''}
              pr-11
              ${error ? 'border-vax-error-DEFAULT ring-vax-error-DEFAULT/10' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-focus-within:rotate-180">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';

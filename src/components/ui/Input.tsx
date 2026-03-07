import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    ...props
  }, ref) => {
    const inputClasses = `
      block w-full rounded-md border bg-white px-3 py-2 text-sm text-surface-800 placeholder:text-surface-400
      transition-colors duration-150
      ${error
        ? 'border-red-300 focus:ring-1 focus:ring-red-500 focus:border-red-500'
        : 'border-surface-300 focus:ring-1 focus:ring-brand-500 focus:border-brand-500'
      }
      focus:outline-none
      ${leftIcon ? 'pl-9' : ''}
      ${rightIcon ? 'pr-9' : ''}
    `;

    const containerClasses = fullWidth ? 'w-full' : '';

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-surface-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-surface-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`${inputClasses} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-surface-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-surface-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

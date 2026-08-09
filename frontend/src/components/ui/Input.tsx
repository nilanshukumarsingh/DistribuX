import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full rounded-lg border ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
          } bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

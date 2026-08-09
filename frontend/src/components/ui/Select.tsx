import React from 'react';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={`block w-full rounded-lg border ${
            error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
          } bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

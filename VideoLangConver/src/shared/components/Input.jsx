import React from 'react';

/**
 * Enterprise Reusable Form & Search Input
 * Supports prefix icons, error states, and clearable text.
 */
export default function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = 'left',
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-gray-300 uppercase tracking-wider"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3.5 text-gray-400 text-base pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={inputId}
          className={`
            w-full rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm py-2.5 transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
            ${icon && iconPosition === 'left' ? 'pl-10' : 'pl-4'}
            ${icon && iconPosition === 'right' ? 'pr-10' : 'pr-4'}
            ${error ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-blue-500/50'}
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <span className="absolute right-3.5 text-gray-400 text-base pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-gray-400">{helperText}</p>
      ) : null}
    </div>
  );
}

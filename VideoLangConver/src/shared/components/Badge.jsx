import React from 'react';

/**
 * Enterprise Reusable Badge Component
 * Status indicators, language tags, format labels.
 */
export default function Badge({
  children,
  variant = 'neutral', // 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'neutral'
  size = 'md',        // 'sm' | 'md'
  icon = null,
  className = ''
}) {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    red: 'bg-red-500/15 text-red-400 border border-red-500/30',
    neutral: 'bg-white/10 text-gray-300 border border-white/10'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full tracking-wide select-none
        ${sizeStyles[size] || sizeStyles.md}
        ${variantStyles[variant] || variantStyles.neutral}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

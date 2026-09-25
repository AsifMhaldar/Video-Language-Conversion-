import React from 'react';

/**
 * Enterprise Reusable Spinner & Loading State
 */
export default function Spinner({
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  message = null,
  color = 'blue', // 'blue' | 'purple' | 'white'
  className = ''
}) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const colorMap = {
    blue: 'border-blue-500/20 border-t-blue-500',
    purple: 'border-purple-500/20 border-t-purple-500',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeMap[size] || sizeMap.md} ${colorMap[color] || colorMap.blue}`}
      />
      {message && <p className="text-xs text-gray-400 font-medium">{message}</p>}
    </div>
  );
}

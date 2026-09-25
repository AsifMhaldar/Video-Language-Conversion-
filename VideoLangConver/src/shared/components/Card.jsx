import React from 'react';

/**
 * Enterprise Reusable Card Component
 * Glassmorphic surface with subtle borders, glowing highlights, and hover elevation.
 */
export default function Card({
  children,
  className = '',
  hoverEffect = false,
  glow = 'none', // 'none' | 'blue' | 'purple' | 'green' | 'amber'
  onClick,
  ...props
}) {
  const glowStyles = {
    none: 'bg-[#11111e]/70 border-white/10',
    blue: 'bg-gradient-to-b from-blue-500/10 via-[#11111e]/80 to-[#11111e] border-blue-500/20 hover:border-blue-500/40',
    purple: 'bg-gradient-to-b from-purple-500/10 via-[#11111e]/80 to-[#11111e] border-purple-500/20 hover:border-purple-500/40',
    green: 'bg-gradient-to-b from-emerald-500/10 via-[#11111e]/80 to-[#11111e] border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'bg-gradient-to-b from-amber-500/10 via-[#11111e]/80 to-[#11111e] border-amber-500/20 hover:border-amber-500/40'
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl border backdrop-blur-md p-5 transition-all duration-300
        ${glowStyles[glow] || glowStyles.none}
        ${hoverEffect || isClickable ? 'hover:-translate-y-1 hover:shadow-xl' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-3 border-b border-white/10 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`pt-3 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`pt-3 mt-3 border-t border-white/5 flex items-center justify-between gap-3 ${className}`}>
      {children}
    </div>
  );
};

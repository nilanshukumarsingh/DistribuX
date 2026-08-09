import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'sm' }) => {
  const variantStyles = {
    default: 'bg-cyan-950 text-cyan-300 border-cyan-500/40',
    success: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-950 text-amber-300 border-amber-500/40',
    danger: 'bg-rose-950 text-rose-300 border-rose-500/40',
    info: 'bg-sky-950 text-sky-300 border-sky-500/40',
    purple: 'bg-purple-950 text-purple-300 border-purple-500/40',
    gray: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
};

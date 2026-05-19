import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StatCard = ({ title, value, subtitle, icon: Icon, className }) => {
  return (
    <div className={cn("glass-panel p-6 flex flex-col items-start relative overflow-hidden group", className)}>
      <div className="absolute -right-6 -top-6 text-slate-800/20 transform group-hover:scale-110 transition-transform duration-500">
        {Icon && <Icon size={120} strokeWidth={1} />}
      </div>
      
      <h3 className="text-slate-400 font-medium text-sm tracking-wide uppercase mb-2 relative z-10">{title}</h3>
      <div className="text-4xl font-bold text-slate-100 mb-1 relative z-10">{value}</div>
      {subtitle && (
        <div className="text-sm text-slate-400 relative z-10">{subtitle}</div>
      )}
    </div>
  );
}

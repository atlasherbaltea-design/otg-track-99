
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  description?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, description, trend }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 p-6 flex flex-col justify-between hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform duration-500`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${trend.isUp ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em] mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black text-secondary dark:text-white tracking-tighter">{value}</h3>
          {description && <span className="text-[9px] font-bold text-slate-400 truncate">{description}</span>}
        </div>
      </div>
    </div>
  );
};

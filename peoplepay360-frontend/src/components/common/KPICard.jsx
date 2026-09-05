'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const ICON_BG_COLORS = {
  indigo: 'bg-indigo-100 text-indigo-600',
  blue: 'bg-blue-100 text-blue-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  amber: 'bg-amber-100 text-amber-600',
  violet: 'bg-violet-100 text-violet-600',
  rose: 'bg-rose-100 text-rose-600',
  cyan: 'bg-cyan-100 text-cyan-600',
  orange: 'bg-orange-100 text-orange-600',
};

export default function KPICard({
  label,
  value,
  subValue,
  change,
  changeLabel,
  icon: Icon,
  color = 'indigo',
  prefix = '',
  suffix = '',
  note,
  onClick,
}) {
  const changeDir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const TrendIcon = changeDir === 'up' ? TrendingUp : changeDir === 'down' ? TrendingDown : Minus;
  const trendColor = changeDir === 'up' ? 'text-emerald-600' : changeDir === 'down' ? 'text-red-500' : 'text-slate-400';

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-indigo-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {note && <p className="text-xs text-slate-400 mt-0.5">{note}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ICON_BG_COLORS[color] || ICON_BG_COLORS.indigo}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-bold text-slate-900 leading-tight">
            {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}{suffix}
          </p>
          {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        </div>

        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={14} />
            <span>{Math.abs(change)}%</span>
            {changeLabel && <span className="text-slate-400 font-normal">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

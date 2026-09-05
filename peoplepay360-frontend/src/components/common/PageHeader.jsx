'use client';

export default function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {breadcrumb && <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{breadcrumb}</p>}
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 ml-4">{actions}</div>
      )}
    </div>
  );
}

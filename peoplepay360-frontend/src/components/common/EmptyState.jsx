'use client';

import { PackageSearch, FileX, Search } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description, action, icon: Icon = PackageSearch }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-center shadow-sm">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

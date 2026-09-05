'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="bg-white rounded-2xl border border-red-200 p-12 flex flex-col items-center text-center shadow-sm">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-xs">{description}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}

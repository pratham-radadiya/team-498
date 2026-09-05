'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmLabel = 'Confirm', danger = false, loading = false }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center py-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? 'bg-red-100' : 'bg-amber-100'}`}>
          {danger ? <Trash2 size={28} className="text-red-600" /> : <AlertTriangle size={28} className="text-amber-600" />}
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onClose} className="flex-1 py-2.5 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium text-sm hover:bg-slate-50 transition">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm text-white transition flex items-center justify-center gap-2
            ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'} disabled:opacity-60`}
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

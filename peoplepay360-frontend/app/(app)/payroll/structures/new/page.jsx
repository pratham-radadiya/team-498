'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { payrollApi } from '../../../../../src/api/payrollApi.js';
import RoleGuard from '../../../../../src/components/common/RoleGuard.jsx';
import { LayoutList, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewSalaryStructurePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await payrollApi.createStructure({
      ...formData,
      employeeCount: 0,
      rulesCount: 0,
    });
    setLoading(false);
    router.push('/payroll/structures');
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR_PAYROLL_MANAGER']}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/payroll/structures"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Salary Structure</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Define a reusable salary structure template and its calculation framework.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Structure Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Executive Management Structure"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Applied to senior directors and C-level roles with performance equity allowances."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/75 transition">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <div>
                <div className="text-sm font-medium text-slate-800">Active Template</div>
                <div className="text-xs text-slate-500">Available for assignment to employee contracts.</div>
              </div>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/payroll/structures"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Create Structure'}</span>
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}

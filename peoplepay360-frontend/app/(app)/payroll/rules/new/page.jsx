'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { payrollApi } from '../../../../../src/api/payrollApi.js';
import RoleGuard from '../../../../../src/components/common/RoleGuard.jsx';
import { Settings, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewSalaryRulePage() {
  const router = useRouter();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    structureId: 'STR001',
    structureName: 'Regular Salary',
    name: '',
    code: '',
    category: 'Allowance',
    sequence: 25,
    computationMethod: 'Percentage',
    value: '10% of Basic',
    formula: '',
  });

  useEffect(() => {
    payrollApi.getStructures().then((res) => setStructures(res.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await payrollApi.createRule(formData);
    setLoading(false);
    router.push('/payroll/rules');
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR_PAYROLL_MANAGER']}>
      <div className="max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/payroll/rules"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Salary Rule</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add a calculation rule, allowance, statutory deduction, or equation to a structure.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Salary Structure</label>
            <select
              value={formData.structureId}
              onChange={(e) => {
                const s = structures.find((x) => x.id === e.target.value);
                setFormData({
                  ...formData,
                  structureId: e.target.value,
                  structureName: s?.name || 'Regular Salary',
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {structures.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Wellness Stipend"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Code (Unique Uppercase)</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. WELLNESS"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Basic">Basic</option>
                <option value="Allowance">Allowance</option>
                <option value="Gross">Gross</option>
                <option value="Deduction">Deduction</option>
                <option value="Net">Net</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sequence Order</label>
              <input
                type="number"
                value={formData.sequence}
                onChange={(e) => setFormData({ ...formData, sequence: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Computation Method</label>
              <select
                value={formData.computationMethod}
                onChange={(e) => setFormData({ ...formData, computationMethod: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Fixed Amount">Fixed Amount</option>
                <option value="Percentage">Percentage</option>
                <option value="Percentage of Wage">Percentage of Wage</option>
                <option value="Formula">Python / Expression Formula</option>
              </select>
            </div>
          </div>

          {formData.computationMethod === 'Formula' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Formula Expression</label>
              <input
                type="text"
                value={formData.formula}
                onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                placeholder="result = categories['BASIC'] * 0.15"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Value Expression / Amount</label>
              <input
                type="text"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder="e.g. $250 or 15% of Basic"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/payroll/rules"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.code}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Creating...' : 'Create Salary Rule'}</span>
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../../../src/components/common/Guards.jsx';
import { getSalaryStructureApi } from '../../../../../src/api/payrollApi.js';
import { PERMISSIONS } from '../../../../../src/lib/permissions.js';
import { ArrowLeft, Plus, Settings } from 'lucide-react';

const CATEGORY_COLORS = {
  Basic: 'bg-blue-100 text-blue-700 border-blue-200',
  Allowance: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Gross: 'bg-slate-100 text-slate-700 border-slate-200',
  Deduction: 'bg-red-100 text-red-700 border-red-200',
  Net: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export default function SalaryStructureDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalaryStructureApi(id).then((s) => { setStructure(s); setLoading(false); });
  }, [id]);

  if (loading) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-64" />;
  if (!structure) return <div className="text-center py-20 text-slate-400">Structure not found.</div>;

  const categories = [...new Set(structure.rules?.map((r) => r.category) || [])];

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
          <ArrowLeft size={16} /> Back to Structures
        </button>
        <PermissionGuard permission={PERMISSIONS.SALARY_STRUCTURES_MANAGE}>
          <Link href={`/payroll/rules?structure=${id}`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
            <Plus size={14} /> Add Rule
          </Link>
        </PermissionGuard>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{structure.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{structure.description}</p>
          </div>
          <StatusBadge status={structure.active ? 'Active' : 'Inactive'} showDot />
        </div>
        <div className="flex gap-6 text-sm">
          <div><span className="text-slate-500">Rules:</span> <span className="font-bold text-slate-900">{structure.rules?.length}</span></div>
          <div><span className="text-slate-500">Employees:</span> <span className="font-bold text-slate-900">{structure.employeeCount}</span></div>
        </div>
      </div>

      {/* Rules table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Salary Rules</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Seq', 'Name', 'Code', 'Category', 'Computation', 'Value/Formula'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {structure.rules?.map((rule) => (
              <tr key={rule.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">{rule.sequence}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{rule.name}</td>
                <td className="px-4 py-3 text-xs font-mono font-semibold text-indigo-600">{rule.code}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${CATEGORY_COLORS[rule.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {rule.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{rule.computationMethod}</td>
                <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                  {rule.formula ? <span className="bg-slate-100 px-2 py-1 rounded text-xs">{rule.formula.split('\n')[0]}...</span> : rule.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

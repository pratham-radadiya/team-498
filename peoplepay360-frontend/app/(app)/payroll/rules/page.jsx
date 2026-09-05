'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../../src/components/common/DataTable.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { getSalaryRulesApi } from '../../../../src/api/payrollApi.js';
import { mockSalaryStructures } from '../../../../src/mock/payroll.js';
import { PERMISSIONS } from '../../../../src/lib/permissions.js';
import { Plus } from 'lucide-react';

const CATEGORY_COLORS = {
  Basic: 'bg-blue-100 text-blue-700',
  Allowance: 'bg-emerald-100 text-emerald-700',
  Gross: 'bg-slate-100 text-slate-700',
  Deduction: 'bg-red-100 text-red-700',
  Net: 'bg-indigo-100 text-indigo-700',
};

export default function SalaryRulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const structureFilter = searchParams.get('structure');

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [structureId, setStructureId] = useState(structureFilter || '');

  useEffect(() => {
    setLoading(true);
    getSalaryRulesApi({ structureId: structureId || undefined }).then((res) => {
      setRules(res.data);
      setLoading(false);
    });
  }, [structureId]);

  const columns = [
    { key: 'sequence', label: 'Seq', render: (v) => <span className="font-mono text-xs text-slate-400">{v}</span> },
    { key: 'name', label: 'Rule Name', render: (v) => <span className="font-medium text-slate-800">{v}</span> },
    { key: 'code', label: 'Code', render: (v) => <span className="font-mono font-semibold text-indigo-600 text-xs">{v}</span> },
    { key: 'structureName', label: 'Structure' },
    { key: 'category', label: 'Category', render: (v) => (
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORY_COLORS[v] || 'bg-slate-100 text-slate-700'}`}>{v}</span>
    )},
    { key: 'computationMethod', label: 'Computation' },
    { key: 'value', label: 'Value', render: (v, row) => row.formula ? <span className="text-xs text-slate-400 italic">Formula</span> : <span className="text-sm text-slate-700">{v}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Salary Rules"
        subtitle="Configure individual salary computation rules"
        actions={
          <PermissionGuard permission={PERMISSIONS.SALARY_RULES_MANAGE}>
            <Link href="/payroll/rules/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Rule
            </Link>
          </PermissionGuard>
        }
      />

      <div className="flex gap-3">
        <select value={structureId} onChange={(e) => setStructureId(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Structures</option>
          {mockSalaryStructures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={rules} loading={loading} emptyMessage="No salary rules found." total={rules.length} />
    </div>
  );
}

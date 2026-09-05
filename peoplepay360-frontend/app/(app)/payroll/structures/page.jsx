'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { getSalaryStructuresApi, deleteSalaryStructureApi } from '../../../../src/api/payrollApi.js';
import { PERMISSIONS } from '../../../../src/lib/permissions.js';
import { Plus, Layers, Edit, Trash2, ChevronRight } from 'lucide-react';

export default function SalaryStructuresPage() {
  const router = useRouter();
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSalaryStructuresApi().then((res) => { setStructures(res.data); setLoading(false); });
  }, []);

  const handleDelete = async (id) => {
    await deleteSalaryStructureApi(id);
    setStructures((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Salary Structures"
        subtitle="Define and manage salary component configurations"
        actions={
          <PermissionGuard permission={PERMISSIONS.SALARY_STRUCTURES_MANAGE}>
            <Link href="/payroll/structures/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Structure
            </Link>
          </PermissionGuard>
        }
      />

      {loading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-24" />)}</div>
      ) : (
        <div className="space-y-3">
          {structures.map((str) => (
            <div key={str.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition group cursor-pointer" onClick={() => router.push(`/payroll/structures/${str.id}`)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Layers size={18} className="text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">{str.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{str.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-slate-900">{str.rulesCount}</p>
                    <p className="text-xs text-slate-400">Rules</p>
                  </div>
                  <div className="text-center hidden sm:block">
                    <p className="text-lg font-bold text-slate-900">{str.employeeCount}</p>
                    <p className="text-xs text-slate-400">Employees</p>
                  </div>
                  <StatusBadge status={str.active ? 'Active' : 'Inactive'} size="xs" />
                  <PermissionGuard permission={PERMISSIONS.SALARY_STRUCTURES_MANAGE}>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => router.push(`/payroll/rules?structure=${str.id}`)} className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(str.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={15} /></button>
                    </div>
                  </PermissionGuard>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-400 transition" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

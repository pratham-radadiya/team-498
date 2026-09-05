'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { getPayrunsApi } from '../../../../src/api/payrollApi.js';
import { PERMISSIONS } from '../../../../src/lib/permissions.js';
import { Plus, AlertTriangle, Users, DollarSign } from 'lucide-react';

const formatINR = (v) => v ? `₹${(v / 100000).toFixed(1)}L` : '—';

const STATUS_STEP = { Draft: 1, Computed: 2, Validated: 3, Paid: 4 };
const STEPS = ['Draft', 'Computed', 'Validated', 'Paid'];

function PayrunCard({ payrun, onClick }) {
  const step = STATUS_STEP[payrun.status] || 1;

  return (
    <div onClick={onClick} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">{payrun.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{payrun.salaryStructureName}</p>
        </div>
        <div className="flex items-center gap-2">
          {payrun.warnings > 0 && (
            <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
              <AlertTriangle size={12} />{payrun.warnings}
            </span>
          )}
          <StatusBadge status={payrun.status} size="xs" showDot />
        </div>
      </div>

      {/* Progress tracker */}
      <div className="flex items-center mb-4">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border-2 transition
              ${i + 1 < step ? 'bg-indigo-600 border-indigo-600 text-white' : i + 1 === step ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-300'}`}>
              {i + 1 < step ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded ${i + 1 < step ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-slate-400 mb-4">
        {STEPS.map((s) => <span key={s}>{s}</span>)}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center bg-slate-50 rounded-xl py-2">
          <p className="text-xs text-slate-400">Employees</p>
          <p className="font-bold text-slate-800 text-sm">{payrun.employeeCount}</p>
        </div>
        <div className="text-center bg-slate-50 rounded-xl py-2">
          <p className="text-xs text-slate-400">Gross</p>
          <p className="font-bold text-slate-800 text-sm">{formatINR(payrun.totalGross)}</p>
        </div>
        <div className="text-center bg-emerald-50 rounded-xl py-2">
          <p className="text-xs text-emerald-600">Net</p>
          <p className="font-bold text-emerald-700 text-sm">{formatINR(payrun.totalNet)}</p>
        </div>
      </div>
    </div>
  );
}

export default function PayrunsPage() {
  const router = useRouter();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    getPayrunsApi().then((res) => {
      setPayruns(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = statusFilter ? payruns.filter((p) => p.status === statusFilter) : payruns;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payroll Runs"
        subtitle="Process and manage monthly payroll cycles"
        actions={
          <PermissionGuard permission={PERMISSIONS.PAYRUN_CREATE}>
            <Link href="/payroll/payruns/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm">
              <Plus size={16} /> New Payrun
            </Link>
          </PermissionGuard>
        }
      />

      <div className="flex gap-2 flex-wrap">
        {['', 'Draft', 'Computed', 'Validated', 'Paid'].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-52" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((pr) => (
            <PayrunCard key={pr.id} payrun={pr} onClick={() => router.push(`/payroll/payruns/${pr.id}`)} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          No payruns found for this filter.
        </div>
      )}
    </div>
  );
}

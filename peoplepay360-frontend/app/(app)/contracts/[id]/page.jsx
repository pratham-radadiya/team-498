'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { getContractById } from '../../../../src/mock/contracts.js';
import { ArrowLeft, User, Calendar, DollarSign, Briefcase, Building, FileText } from 'lucide-react';

const formatINR = (v) => `₹${v?.toLocaleString('en-IN') || 0}`;

function InfoItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={16} className="text-slate-400 mt-0.5 shrink-0" />}
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setContract(getContractById(decodeURIComponent(id)));
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-64" />;
  if (!contract) return <div className="text-center py-20 text-slate-400">Contract not found.</div>;

  return (
    <div className="max-w-3xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
        <ArrowLeft size={16} /> Back to Contracts
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="font-mono text-sm text-indigo-600 font-semibold">{contract.id}</span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">{contract.employeeName} — {contract.jobPosition}</h1>
          </div>
          <StatusBadge status={contract.status} size="lg" showDot />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <InfoItem label="Employee" value={contract.employeeName} icon={User} />
          <InfoItem label="Department" value={contract.department} icon={Building} />
          <InfoItem label="Job Position" value={contract.jobPosition} icon={Briefcase} />
          <InfoItem label="Start Date" value={contract.startDate} icon={Calendar} />
          <InfoItem label="End Date" value={contract.endDate || 'Permanent'} icon={Calendar} />
          <InfoItem label="Wage / Month" value={formatINR(contract.wage)} icon={DollarSign} />
          <InfoItem label="Working Schedule" value={contract.workingScheduleName} icon={Calendar} />
          <InfoItem label="Salary Structure" value={contract.salaryStructureName} icon={FileText} />
        </div>

        {contract.notes && (
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-slate-700">{contract.notes}</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link href={`/employees/${contract.employeeId}`} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <User size={15} /> View Employee
        </Link>
        <Link href={`/payroll/structures/${contract.salaryStructureId}`} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
          <FileText size={15} /> View Salary Structure
        </Link>
      </div>
    </div>
  );
}

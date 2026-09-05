'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { getEmployeeApi, getEmployeeStatsApi } from '../../../../src/api/employeeApi.js';
import { PERMISSIONS } from '../../../../src/lib/permissions.js';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Calendar, Users, FileText, Clock, Umbrella, DollarSign, Briefcase, Building } from 'lucide-react';

function SmartButton({ label, count, href, icon: Icon, color = 'indigo' }) {
  const colors = {
    indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    amber: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    violet: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  };
  return (
    <Link href={href} className={`flex flex-col items-center p-4 rounded-2xl border transition ${colors[color] || colors.indigo}`}>
      {Icon && <Icon size={22} className="mb-2" />}
      <span className="text-2xl font-bold">{count}</span>
      <span className="text-xs font-medium mt-0.5">{label}</span>
    </Link>
  );
}

function InfoItem({ label, value, icon: Icon }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      {Icon && <div className="mt-0.5 text-slate-400"><Icon size={16} /></div>}
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm text-slate-800 font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work');

  useEffect(() => {
    setLoading(true);
    Promise.all([getEmployeeApi(id), getEmployeeStatsApi(id)])
      .then(([emp, st]) => { setEmployee(emp); setStats(st); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-8 bg-slate-200 rounded-xl w-48 animate-pulse" />
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p className="text-lg font-medium">Employee not found.</p>
        <button onClick={() => router.push('/employees')} className="mt-4 text-indigo-600 hover:underline text-sm">Back to Employees</button>
      </div>
    );
  }

  const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const colorIdx = (employee.name?.charCodeAt(0) || 0) % colors.length;

  return (
    <div className="space-y-5">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push('/employees')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEES_UPDATE}>
          <Link href={`/employees/${id}?edit=true`} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
            <Edit size={15} /> Edit Employee
          </Link>
        </PermissionGuard>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className={`w-20 h-20 ${colors[colorIdx]} rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0 shadow-lg`}>
            {employee.initials || employee.name?.charAt(0)}
          </div>

          {/* Basic info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">{employee.name}</h1>
              <StatusBadge status={employee.status} showDot />
            </div>
            <p className="text-slate-500 mt-1">{employee.jobPosition} • {employee.department}</p>
            <p className="text-sm text-slate-400 mt-0.5">ID: {employee.id}</p>
          </div>

          {/* Smart buttons */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full sm:w-auto">
            <SmartButton label="Contracts" count={stats?.contracts || 0} href={`/contracts?employee=${id}`} icon={FileText} color="indigo" />
            <SmartButton label="Attendance" count={stats?.attendance || 0} href={`/attendance?employee=${id}`} icon={Clock} color="emerald" />
            <SmartButton label="Time Off" count={stats?.timeOff || 0} href={`/time-off/requests?employee=${id}`} icon={Umbrella} color="amber" />
            <SmartButton label="Allocations" count={stats?.allocations || 0} href={`/time-off/allocations?employee=${id}`} icon={Calendar} color="violet" />
            <PermissionGuard permission={PERMISSIONS.PAYSLIPS_READ}>
              <SmartButton label="Payslips" count={stats?.payslips || 0} href={`/payroll/payslips?employee=${id}`} icon={DollarSign} color="cyan" />
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        {['work', 'private'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'work' ? 'Work Information' : 'Private Information'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'work' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Employment Details</h3>
            <div className="space-y-4">
              <InfoItem label="Department" value={employee.department} icon={Building} />
              <InfoItem label="Job Position" value={employee.jobPosition} icon={Briefcase} />
              <InfoItem label="Employee Type" value={employee.employeeType} icon={Users} />
              <InfoItem label="Working Schedule" value={employee.workingScheduleName} icon={Clock} />
              <InfoItem label="Manager" value={employee.managerName || '—'} icon={Users} />
              <InfoItem label="Joining Date" value={employee.joiningDate} icon={Calendar} />
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Work Location</h3>
            <div className="space-y-4">
              <InfoItem label="Work Location" value={employee.workLocation} icon={MapPin} />
              <InfoItem label="Company" value={employee.company} icon={Building} />
              <InfoItem label="Status" value={employee.status} icon={Users} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'private' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Work Email" value={employee.email} icon={Mail} />
            <InfoItem label="Phone" value={employee.phone} icon={Phone} />
            <InfoItem label="Gender" value={employee.gender} icon={Users} />
          </div>
        </div>
      )}
    </div>
  );
}

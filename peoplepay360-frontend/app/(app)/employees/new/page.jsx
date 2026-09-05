'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import { createEmployeeApi } from '../../../../src/api/employeeApi.js';
import { DEPARTMENTS } from '../../../../src/mock/employees.js';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', department: '', jobPosition: '', employeeType: 'Full-time',
    status: 'Active', joiningDate: '', workingScheduleName: '40 Hours/Week', workingScheduleId: 'SCH001',
    workLocation: '', gender: '', company: 'PeoplePay360 Pvt Ltd',
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const initials = form.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
      const newEmp = await createEmployeeApi({ ...form, initials });
      router.push(`/employees/${newEmp.id}`);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type = 'text', required = false, children) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor={name}>{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children || (
        <input id={name} name={name} type={type} value={form[name]} onChange={handleChange} required={required}
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
        />
      )}
    </div>
  );

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition"><ArrowLeft size={20} /></button>
        <PageHeader title="Add New Employee" subtitle="Create a new employee record" />
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Full Name', 'name', 'text', true)}
            {field('Work Email', 'email', 'email', true)}
            {field('Phone Number', 'phone', 'tel')}
            {field('Gender', 'gender', 'text', false,
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">Employment Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {field('Department', 'department', 'text', true,
              <select name="department" value={form.department} onChange={handleChange} required className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            )}
            {field('Job Position', 'jobPosition', 'text', true)}
            {field('Employee Type', 'employeeType', 'text', false,
              <select name="employeeType" value={form.employeeType} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Intern</option>
              </select>
            )}
            {field('Status', 'status', 'text', false,
              <select name="status" value={form.status} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Active</option><option>Inactive</option>
              </select>
            )}
            {field('Joining Date', 'joiningDate', 'date', true)}
            {field('Work Location', 'workLocation')}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={() => router.back()} className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
            {loading ? 'Saving...' : 'Create Employee'}
          </button>
        </div>
      </form>
    </div>
  );
}

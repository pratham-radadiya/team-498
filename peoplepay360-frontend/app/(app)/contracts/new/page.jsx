'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { contractApi } from '../../../../src/api/contractApi.js';
import { employeeApi } from '../../../../src/api/employeeApi.js';
import { scheduleApi } from '../../../../src/api/scheduleApi.js';
import { payrollApi } from '../../../../src/api/payrollApi.js';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import { FileText, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewContractPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    department: 'Engineering',
    jobPosition: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    wage: 80000,
    workingScheduleId: 'SCH001',
    workingScheduleName: '40 Hours/Week',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      employeeApi.getEmployees(),
      scheduleApi.getSchedules(),
      payrollApi.getStructures(),
    ]).then(([eRes, sRes, strRes]) => {
      setEmployees(eRes.data || []);
      setSchedules(sRes.data || []);
      setStructures(strRes.data || []);
    });
  }, []);

  const handleEmployeeChange = (empId) => {
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setFormData({
        ...formData,
        employeeId: emp.id,
        employeeName: emp.name,
        department: emp.department,
        jobPosition: emp.jobPosition,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await contractApi.createContract(formData);
    setLoading(false);
    router.push('/contracts');
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER']}>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/contracts"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Draft Employment Contract</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Specify compensation terms, salary structure, and assigned work schedule.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Employee</label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => handleEmployeeChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.department} - {emp.jobPosition})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                readOnly
                value={formData.department}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Position</label>
              <input
                type="text"
                value={formData.jobPosition}
                onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Base Wage ($)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.wage}
                onChange={(e) => setFormData({ ...formData, wage: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Structure Template</label>
              <select
                value={formData.salaryStructureId}
                onChange={(e) => {
                  const s = structures.find((x) => x.id === e.target.value);
                  setFormData({
                    ...formData,
                    salaryStructureId: e.target.value,
                    salaryStructureName: s?.name || 'Regular Salary',
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {structures.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Working Schedule</label>
            <select
              value={formData.workingScheduleId}
              onChange={(e) => {
                const sc = schedules.find((x) => x.id === e.target.value);
                setFormData({
                  ...formData,
                  workingScheduleId: e.target.value,
                  workingScheduleName: sc?.name || '40 Hours/Week',
                });
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {schedules.map((sc) => (
                <option key={sc.id} value={sc.id}>{sc.name} ({sc.weeklyHours}h/week)</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contract Terms & Notes</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Standard full-time employment subject to 3-month review..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/contracts"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.employeeId}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Creating...' : 'Create Contract'}</span>
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}

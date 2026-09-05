'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPayrunApi } from '../../../../../src/api/payrollApi.js';
import { mockSalaryStructures } from '../../../../../src/mock/payroll.js';
import { ArrowLeft, Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Basic Info', desc: 'Period and structure' },
  { id: 2, label: 'Employees', desc: 'Payrun scope' },
  { id: 3, label: 'Review', desc: 'Confirm and create' },
];

export default function NewPayrunPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '',
    periodEnd: '',
    employeeScope: 'all',
    employeeIds: [],
  });

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreate = async () => {
    setLoading(true);
    try {
      const sel = mockSalaryStructures.find((s) => s.id === form.salaryStructureId);
      const pr = await createPayrunApi({
        name: form.name || `Payrun ${form.periodStart}`,
        salaryStructureId: form.salaryStructureId,
        salaryStructureName: sel?.name || '',
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        employeeCount: form.employeeScope === 'all' ? 50 : form.employeeIds.length,
      });
      router.push(`/payroll/payruns/${pr.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
        <ArrowLeft size={16} /> Back to Payruns
      </button>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Payrun</h1>
        <p className="text-slate-400 text-sm mt-1">Set up a new payroll run for your employees</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition
                ${step > s.id ? 'bg-indigo-600 border-indigo-600 text-white' : step === s.id ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                {step > s.id ? <Check size={14} /> : s.id}
              </div>
              <div className={`hidden sm:block text-xs ${step >= s.id ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
                <p>{s.label}</p>
                <p className="text-slate-400 font-normal">{s.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 rounded ${step > s.id ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 mb-2">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Payrun Name</label>
              <input type="text" placeholder="e.g. September 2026" value={form.name} onChange={(e) => updateForm({ name: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Structure *</label>
              <select value={form.salaryStructureId} onChange={(e) => {
                const sel = mockSalaryStructures.find((s) => s.id === e.target.value);
                updateForm({ salaryStructureId: e.target.value, salaryStructureName: sel?.name || '' });
              }} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                {mockSalaryStructures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Period Start *</label>
                <input type="date" value={form.periodStart} onChange={(e) => updateForm({ periodStart: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Period End *</label>
                <input type="date" value={form.periodEnd} onChange={(e) => updateForm({ periodEnd: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 mb-2">Employee Scope</h2>
            <div className="space-y-3">
              {[
                { value: 'all', label: 'All Active Employees', desc: 'Include all employees with a running contract (50 employees)' },
                { value: 'department', label: 'By Department', desc: 'Select specific departments to include' },
                { value: 'manual', label: 'Manual Selection', desc: 'Handpick specific employees' },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${form.employeeScope === opt.value ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}>
                  <input type="radio" name="scope" value={opt.value} checked={form.employeeScope === opt.value} onChange={(e) => updateForm({ employeeScope: e.target.value })} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-900 mb-4">Review & Confirm</h2>
            <div className="space-y-3">
              {[
                { label: 'Payrun Name', value: form.name || `Payrun ${form.periodStart}` },
                { label: 'Salary Structure', value: form.salaryStructureName },
                { label: 'Period', value: form.periodStart && form.periodEnd ? `${form.periodStart} → ${form.periodEnd}` : 'Not specified' },
                { label: 'Employee Scope', value: form.employeeScope === 'all' ? 'All Active (50)' : form.employeeScope === 'department' ? 'By Department' : 'Manual' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-800">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mt-4">
              ⚠️ After creation, the payrun will be in <strong>Draft</strong> status. Click <strong>Compute Payslips</strong> on the payrun to start processing.
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={step === 1 ? () => router.back() : handleBack}
          className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition"
        >
          {step === 1 ? 'Cancel' : '← Back'}
        </button>
        {step < 3 ? (
          <button onClick={handleNext} disabled={step === 1 && (!form.periodStart || !form.periodEnd)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
            Next →
          </button>
        ) : (
          <button onClick={handleCreate} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
            {loading ? 'Creating...' : 'Create Payrun'}
          </button>
        )}
      </div>
    </div>
  );
}

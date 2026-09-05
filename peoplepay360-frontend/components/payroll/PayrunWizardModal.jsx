'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { X, CreditCard, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, ChevronDown, Check } from 'lucide-react';

export default function PayrunWizardModal({
  isOpen,
  onClose,
  fetchEligibleEmployees,
  createPayrun,
  structureOptions = [],
  onSuccess,
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Step 1 Form Data
  const [name, setName] = useState('');
  const [structureId, setStructureId] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  // Step 2 Eligible Employees Data
  const [eligibleEmployees, setEligibleEmployees] = useState([]);
  const [selectedEmpIds, setSelectedEmpIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError('');
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });

      setName(`Payrun — ${monthName}`);
      setStructureId(structureOptions.length > 0 ? structureOptions[0].id : '');
      setPeriodStart(firstDay);
      setPeriodEnd(lastDay);
      setEligibleEmployees([]);
      setSelectedEmpIds([]);
    }
  }, [isOpen, structureOptions]);

  if (!isOpen) return null;

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Payrun Name is required.');
      return;
    }
    if (!structureId) {
      setError('Salary Structure is required.');
      return;
    }
    if (!periodStart || !periodEnd) {
      setError('Period start date and end date are required.');
      return;
    }
    if (new Date(periodStart) > new Date(periodEnd)) {
      setError('Period start date cannot be later than end date.');
      return;
    }

    setLoading(true);
    try {
      const employees = await fetchEligibleEmployees(periodStart, periodEnd);
      setEligibleEmployees(employees);
      // Select all by default
      setSelectedEmpIds(employees.map((e) => e.id));
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to query eligible employees.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEmployee = (id) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedEmpIds.length === eligibleEmployees.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(eligibleEmployees.map((e) => e.id));
    }
  };

  const handleFinalSubmit = async () => {
    setError('');

    if (selectedEmpIds.length === 0) {
      setError('Please select at least one employee for this payrun.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        structureId,
        periodStart,
        periodEnd,
        employeeIds: selectedEmpIds,
      };

      const newPayrun = await createPayrun(payload);
      onSuccess(newPayrun.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create payrun batch.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  const selectClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-semibold appearance-none cursor-pointer pr-10 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Create Payrun Batch</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {step === 1 ? 'Step 1 of 2: Structure & Pay Period Scope' : 'Step 2 of 2: Select Eligible Employees'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="px-8 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-indigo-600' : 'text-emerald-600'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>1. Payrun Scope</span>
          </div>

          <div className="w-12 h-0.5 bg-slate-200" />

          <div className={`flex items-center gap-2 ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </span>
            <span>2. Participant Selection</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Name, Structure & Period */
            <form id="payrun-step-1" onSubmit={handleStep1Submit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Payrun Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Payrun — March 2026"
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Salary Structure <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={structureId}
                    onChange={(e) => setStructureId(e.target.value)}
                    required
                    className={selectClassName}
                  >
                    <option value="">Select Salary Structure</option>
                    {structureOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  This structure's rules will be evaluated for all generated payslips in this batch.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Pay Period Start <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Pay Period End <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    required
                    className={inputClassName}
                  />
                </div>
              </div>
            </form>
          ) : (
            /* STEP 2: Checkbox Table for Eligible Employees */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                <div>
                  <h3 className="text-sm font-bold text-indigo-900">
                    Eligible Employees ({eligibleEmployees.length} Found)
                  </h3>
                  <p className="text-xs text-indigo-700 mt-0.5">
                    Employees with a Running contract overlapping the period ({formatDate(periodStart)} – {formatDate(periodEnd)})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold shadow-xs hover:bg-indigo-50 transition-all"
                >
                  {selectedEmpIds.length === eligibleEmployees.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {eligibleEmployees.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm font-medium">
                  No employees with an active running contract were found for this period.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 max-h-[350px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-3 px-4 w-10">
                          <input
                            type="checkbox"
                            checked={selectedEmpIds.length === eligibleEmployees.length && eligibleEmployees.length > 0}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-4">Employee Name</th>
                        <th className="py-3 px-4">Contract Start</th>
                        <th className="py-3 px-4">Working Hours</th>
                        <th className="py-3 px-4">Monthly Wage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eligibleEmployees.map((emp) => {
                        const isChecked = selectedEmpIds.includes(emp.id);
                        return (
                          <tr
                            key={emp.id}
                            onClick={() => handleToggleEmployee(emp.id)}
                            className={`cursor-pointer transition-colors ${
                              isChecked ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleEmployee(emp.id)}
                                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900">{emp.name}</td>
                            <td className="py-3 px-4 text-slate-600">{formatDate(emp.startDate)}</td>
                            <td className="py-3 px-4 text-slate-700 font-medium">{emp.workingHours || '40h/wk'}</td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                              {formatCurrency(emp.wage)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Scope</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
            >
              Cancel
            </button>

            {step === 1 ? (
              <button
                type="submit"
                form="payrun-step-1"
                disabled={loading}
                className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue to Participants</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting || selectedEmpIds.length === 0}
                className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Create Payrun Batch ({selectedEmpIds.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { sanitizeDateInput } from '@/lib/formatters';
import { X, FileText, Save, Trash2, AlertCircle, ChevronDown } from 'lucide-react';

export default function ContractFormModal({
  isOpen,
  onClose,
  contractId,
  fetchContractById,
  createContract,
  updateContract,
  deleteContract,
  employeeOptions = [],
  scheduleOptions = [],
  structureOptions = [],
  onSuccess,
}) {
  const isCreate = !contractId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    department: '',
    jobPosition: '',
    startDate: '',
    endDate: '',
    wage: '',
    workingScheduleId: '',
    structureId: '',
    status: 'Running',
    notes: '',
  });

  useEffect(() => {
    if (isOpen && contractId) {
      setLoading(true);
      setError('');
      fetchContractById(contractId)
        .then((data) => {
          setFormData({
            employeeId: data.employeeId || '',
            department: data.department || '',
            jobPosition: data.jobPosition || '',
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : '',
            wage: data.wage !== undefined ? String(data.wage) : '',
            workingScheduleId: data.workingScheduleId || '',
            structureId: data.structureId || '',
            status: data.status || 'Running',
            notes: data.notes || '',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load contract details'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: employeeOptions.length > 0 ? employeeOptions[0].id : '',
        department: '',
        jobPosition: '',
        startDate: today,
        endDate: '',
        wage: '',
        workingScheduleId: scheduleOptions.length > 0 ? scheduleOptions[0].id : '',
        structureId: structureOptions.length > 0 ? structureOptions[0].id : '',
        status: 'Running',
        notes: '',
      });
      setError('');
    }
  }, [isOpen, contractId, isCreate, fetchContractById, employeeOptions, scheduleOptions, structureOptions]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    let { name, value, type } = e.target;
    if (type === 'date' && value) {
      value = sanitizeDateInput(value);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId) {
      setError('Employee selection is required.');
      return;
    }
    if (!formData.startDate) {
      setError('Start Date is required.');
      return;
    }
    if (!formData.wage || Number(formData.wage) <= 0) {
      setError('Wage must be a valid positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        department: formData.department?.trim() || null,
        jobPosition: formData.jobPosition?.trim() || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        wage: Number(formData.wage),
        workingScheduleId: formData.workingScheduleId || null,
        structureId: formData.structureId || null,
        status: formData.status,
        notes: formData.notes?.trim() || null,
      };

      if (isCreate) {
        await createContract(payload);
      } else {
        await updateContract(contractId, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save contract.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this contract?')) {
      try {
        setSubmitting(true);
        await deleteContract(contractId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete contract.');
      } finally {
        setSubmitting(false);
      }
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Create Employment Contract' : 'Edit Contract Details'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Manage employee wage, terms, schedule assignment, and active status
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading contract details...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Picker */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    disabled={!isCreate}
                    className={`${selectClassName} ${!isCreate ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Employee</option>
                    {employeeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Department & Job Position */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Engineering"
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Job Position</label>
                <input
                  type="text"
                  name="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  className={inputClassName}
                />
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  min="1900-01-01"
                  max="2099-12-31"
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min="1900-01-01"
                  max="2099-12-31"
                  placeholder="Omit for ongoing"
                  className={inputClassName}
                />
              </div>

              {/* Wage & Working Schedule */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Monthly Wage (INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="wage"
                  value={formData.wage}
                  onChange={handleChange}
                  placeholder="e.g. 75000"
                  required
                  min="1"
                  className={`${inputClassName} font-mono font-bold`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Working Schedule</label>
                <div className="relative">
                  <select
                    name="workingScheduleId"
                    value={formData.workingScheduleId}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    <option value="">No Schedule Selected</option>
                    {scheduleOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Salary Structure</label>
                <div className="relative">
                  <select
                    name="structureId"
                    value={formData.structureId}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    <option value="">No Structure Selected</option>
                    {structureOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Status */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-2">Contract Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    <option value="Running">Running (Active)</option>
                    <option value="Expired">Expired</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-medium">
                  Note: Only one "Running" contract per employee is permitted per period.
                </p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-2">Notes & Remarks</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional contract terms or notes..."
                  className={inputClassName}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Contract</span>
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
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isCreate ? 'Create Contract' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

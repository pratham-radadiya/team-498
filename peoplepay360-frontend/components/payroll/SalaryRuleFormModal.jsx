'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { X, FileCode, Save, Trash2, AlertCircle, ChevronDown } from 'lucide-react';

export default function SalaryRuleFormModal({
  isOpen,
  onClose,
  ruleId,
  preselectedStructureId,
  fetchRuleById,
  createRule,
  updateRule,
  deleteRule,
  structureOptions = [],
  currentUserRole,
  onSuccess,
}) {
  const isCreate = !ruleId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canManage = canPerformAction(currentUserRole, 'salaryRules', 'edit');

  const [formData, setFormData] = useState({
    structureId: '',
    name: '',
    code: '',
    category: 'Basic',
    sequence: 10,
    computationMethod: 'Fixed',
    fixedAmount: '',
    percentageBase: 'ContractWage',
    percentageValue: '',
    formula: '',
  });

  useEffect(() => {
    if (isOpen && ruleId) {
      setLoading(true);
      setError('');
      fetchRuleById(ruleId)
        .then((data) => {
          setFormData({
            structureId: data.structureId || '',
            name: data.name || '',
            code: data.code || '',
            category: data.category || 'Basic',
            sequence: data.sequence !== undefined ? data.sequence : 10,
            computationMethod: data.computationMethod || 'Fixed',
            fixedAmount: data.fixedAmount !== undefined ? String(data.fixedAmount) : '',
            percentageBase: data.percentageBase || 'ContractWage',
            percentageValue: data.percentageValue !== undefined ? String(data.percentageValue) : '',
            formula: data.formula || '',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load rule details'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
        structureId: preselectedStructureId || (structureOptions.length > 0 ? structureOptions[0].id : ''),
        name: '',
        code: '',
        category: 'Basic',
        sequence: 10,
        computationMethod: 'Fixed',
        fixedAmount: '',
        percentageBase: 'ContractWage',
        percentageValue: '',
        formula: '',
      });
      setError('');
    }
  }, [isOpen, ruleId, isCreate, preselectedStructureId, fetchRuleById, structureOptions]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.structureId) {
      setError('Salary Structure is required.');
      return;
    }
    if (!formData.name.trim()) {
      setError('Rule Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setError('Rule Code is required.');
      return;
    }

    // Validate conditional inputs
    if (formData.computationMethod === 'Fixed') {
      if (!formData.fixedAmount || isNaN(formData.fixedAmount)) {
        setError('Fixed Amount is required and must be a valid number.');
        return;
      }
    } else if (formData.computationMethod === 'Percentage') {
      if (!formData.percentageValue || isNaN(formData.percentageValue)) {
        setError('Percentage Value is required and must be a valid number.');
        return;
      }
    } else if (formData.computationMethod === 'Formula') {
      if (!formData.formula.trim()) {
        setError('Formula expression is required.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        structureId: formData.structureId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        sequence: Number(formData.sequence) || 10,
        computationMethod: formData.computationMethod,
      };

      if (formData.computationMethod === 'Fixed') {
        payload.fixedAmount = Number(formData.fixedAmount);
      } else if (formData.computationMethod === 'Percentage') {
        payload.percentageBase = formData.percentageBase;
        payload.percentageValue = Number(formData.percentageValue);
      } else if (formData.computationMethod === 'Formula') {
        payload.formula = formData.formula.trim();
      }

      if (isCreate) {
        await createRule(payload);
      } else {
        await updateRule(ruleId, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save salary rule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this salary rule?')) {
      try {
        setSubmitting(true);
        await deleteRule(ruleId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete rule.');
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
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Create Salary Rule' : 'Edit Salary Rule'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure computation method, category, execution sequence, and formula parameters
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
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading rule details...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Structure Picker */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Salary Structure <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="structureId"
                    value={formData.structureId}
                    onChange={handleChange}
                    required
                    disabled={!isCreate || !canManage}
                    className={`${selectClassName} ${!isCreate || !canManage ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Structure</option>
                    {structureOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Name & Code */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Rule Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Basic Salary, HRA, Medical Allowance"
                  required
                  disabled={!canManage}
                  className={`${inputClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Rule Code (Unique) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. BASIC, HRA, GROSS, DED_TAX"
                  required
                  disabled={!canManage}
                  className={`${inputClassName} font-mono font-bold uppercase ${!canManage ? 'disabled:opacity-60' : ''}`}
                />
              </div>

              {/* Category & Sequence */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Rule Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={!canManage}
                    className={`${selectClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                  >
                    <option value="Basic">Basic</option>
                    <option value="Allowance">Allowance</option>
                    <option value="Gross">Gross</option>
                    <option value="Deduction">Deduction</option>
                    <option value="Net">Net</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Execution Sequence <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="sequence"
                  value={formData.sequence}
                  onChange={handleChange}
                  required
                  min="1"
                  disabled={!canManage}
                  className={`${inputClassName} font-mono font-bold ${!canManage ? 'disabled:opacity-60' : ''}`}
                />
              </div>

              {/* Computation Method */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Computation Method <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="computationMethod"
                    value={formData.computationMethod}
                    onChange={handleChange}
                    disabled={!canManage}
                    className={`${selectClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                  >
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Formula">Custom Formula Expression</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* DYNAMIC CONDITIONAL INPUTS */}
              {formData.computationMethod === 'Fixed' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Fixed Amount (INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="fixedAmount"
                    value={formData.fixedAmount}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    required
                    disabled={!canManage}
                    className={`${inputClassName} font-mono font-bold ${!canManage ? 'disabled:opacity-60' : ''}`}
                  />
                </div>
              )}

              {formData.computationMethod === 'Percentage' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Percentage Base <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="percentageBase"
                        value={formData.percentageBase}
                        onChange={handleChange}
                        disabled={!canManage}
                        className={`${selectClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                      >
                        <option value="ContractWage">Contract Wage</option>
                        <option value="Basic">Basic Category Amount</option>
                        <option value="Gross">Gross Category Amount</option>
                      </select>
                      <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Percentage Value (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="percentageValue"
                      value={formData.percentageValue}
                      onChange={handleChange}
                      placeholder="e.g. 50 (for 50%)"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                      disabled={!canManage}
                      className={`${inputClassName} font-mono font-bold ${!canManage ? 'disabled:opacity-60' : ''}`}
                    />
                  </div>
                </>
              )}

              {formData.computationMethod === 'Formula' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Formula Expression <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="formula"
                    value={formData.formula}
                    onChange={handleChange}
                    placeholder="e.g. categories.BASIC + categories.HRA"
                    required
                    disabled={!canManage}
                    className={`${inputClassName} font-mono ${!canManage ? 'disabled:opacity-60' : ''}`}
                  />
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Exposed variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">categories</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">wage</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono font-bold">workedDays</code>.
                  </p>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && canManage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Rule</span>
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
            {canManage && (
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
                    <span>{isCreate ? 'Create Rule' : 'Save Changes'}</span>
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

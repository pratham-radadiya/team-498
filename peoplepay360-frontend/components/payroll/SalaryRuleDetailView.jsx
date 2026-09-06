'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSalaryRules } from '@/hooks/useSalaryRules';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  FileCode,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Layers,
  Calculator,
  Percent,
  DollarSign,
  Code
} from 'lucide-react';

export default function SalaryRuleDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const { fetchRuleById, updateRule, deleteRule } = useSalaryRules();
  const { fetchStructureOptions } = useSalaryStructures();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [structureOptions, setStructureOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    structureId: '',
    structureName: '',
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

  const canManage = canPerformAction(currentUserRole, 'salaryRules', 'edit');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      fetchStructureOptions().then((opts) => setStructureOptions(opts || [])).catch(() => {});
      const data = await fetchRuleById(id);
      setFormData({
        structureId: data.structureId || '',
        structureName: data.structure?.name || '',
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
    } catch (err) {
      setError(err.message || 'Failed to load rule details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchRuleById, fetchStructureOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Rule Name is required.');
      return;
    }
    if (!formData.code.trim()) {
      setError('Rule Code is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        sequence: Number(formData.sequence) || 10,
        computationMethod: formData.computationMethod,
        fixedAmount: formData.computationMethod === 'Fixed' ? Number(formData.fixedAmount) || 0 : undefined,
        percentageBase: formData.computationMethod === 'Percentage' ? formData.percentageBase : undefined,
        percentageValue: formData.computationMethod === 'Percentage' ? Number(formData.percentageValue) || 0 : undefined,
        formula: formData.computationMethod === 'Python' ? formData.formula?.trim() || null : undefined,
      };

      await updateRule(id, payload);
      setSuccessMsg('Salary rule saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save salary rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this salary rule?')) return;
    setDeleting(true);
    try {
      await deleteRule(id);
      router.push('/payroll/rules');
    } catch (err) {
      setError(err.message || 'Failed to delete salary rule');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex relative overflow-x-hidden font-sans antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-20 px-4 sm:px-6 pb-8 space-y-4 overflow-y-auto custom-scrollbar">
          <DetailPageHeader
            breadcrumbs={[
              { label: 'Payroll', href: '/payroll' },
              { label: 'Salary Rules', href: '/payroll/rules' },
              { label: formData.code || 'Rule' }
            ]}
            title={formData.name || 'Salary Rule'}
            subtitle={`Category: ${formData.category} • Sequence: ${formData.sequence}`}
            icon={<FileCode className="w-5 h-5" />}
            badge={
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {formData.code || 'CODE'}
              </span>
            }
            backHref="/payroll/rules"
            actions={
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}

                {canManage && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting || loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                )}
              </div>
            }
          />

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-sm">Loading rule configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Identification */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-indigo-600" />
                    Rule Identification
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rule Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!canManage}
                        required
                        placeholder="e.g. Basic Salary, Housing Allowance"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rule Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        disabled={!canManage}
                        required
                        placeholder="BASIC, HRA, PF"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={!canManage}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="Basic">Basic Salary</option>
                        <option value="Allowance">Allowance</option>
                        <option value="Gross">Gross</option>
                        <option value="Deduction">Deduction</option>
                        <option value="Net">Net</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Computation */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    Computation Method & Parameters
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Calculation Mode
                      </label>
                      <select
                        name="computationMethod"
                        value={formData.computationMethod}
                        onChange={handleChange}
                        disabled={!canManage}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="Fixed">Fixed Amount</option>
                        <option value="Percentage">Percentage (%)</option>
                        <option value="Python">Python Code / Expression</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Sequence Priority (Order of Calculation)
                      </label>
                      <input
                        type="number"
                        name="sequence"
                        value={formData.sequence}
                        onChange={handleChange}
                        disabled={!canManage}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {formData.computationMethod === 'Fixed' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fixed Amount ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="fixedAmount"
                        value={formData.fixedAmount}
                        onChange={handleChange}
                        disabled={!canManage}
                        placeholder="0.00"
                        className="w-full md:w-1/2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  )}

                  {formData.computationMethod === 'Percentage' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Percentage Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          name="percentageValue"
                          value={formData.percentageValue}
                          onChange={handleChange}
                          disabled={!canManage}
                          placeholder="e.g. 10 for 10%"
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Percentage Applied On (Base)
                        </label>
                        <select
                          name="percentageBase"
                          value={formData.percentageBase}
                          onChange={handleChange}
                          disabled={!canManage}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                        >
                          <option value="ContractWage">Contract Monthly Wage</option>
                          <option value="Basic">BASIC Result</option>
                          <option value="Gross">GROSS Result</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {formData.computationMethod === 'Python' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Python Expression / Code Block
                      </label>
                      <textarea
                        name="formula"
                        rows={4}
                        value={formData.formula}
                        onChange={handleChange}
                        disabled={!canManage}
                        placeholder="result = contract.wage * 0.15 if employee.is_manager else 0"
                        className="w-full px-3.5 py-2 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                      />
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

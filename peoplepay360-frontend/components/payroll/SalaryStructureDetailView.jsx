'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import SalaryRulePickerModal from './SalaryRulePickerModal';
import {
  Layers,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  FileCode,
  ListFilter,
  ArrowRight
} from 'lucide-react';

export default function SalaryStructureDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchStructureById,
    updateStructure,
    addRulesToStructure,
    deleteStructure,
    deleteRule,
    fetchAvailableRuleOptions,
  } = useSalaryStructures();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    active: true,
  });
  const [assignedRules, setAssignedRules] = useState([]);
  const [isRulePickerOpen, setIsRulePickerOpen] = useState(false);

  const canManage = canPerformAction(currentUserRole, 'salaryStructures', 'edit');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchStructureById(id);
      setFormData({
        name: data.name || '',
        active: data.active ?? true,
      });
      setAssignedRules(data.rules || []);
    } catch (err) {
      setError(err.message || 'Failed to load structure details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchStructureById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRulesSelectedFromPicker = async (selectedRuleObjects) => {
    if (!selectedRuleObjects || selectedRuleObjects.length === 0) return;
    try {
      setSubmitting(true);
      const ruleIds = selectedRuleObjects.map((r) => r.id);
      const updated = await addRulesToStructure(id, ruleIds);
      setAssignedRules(updated.rules || []);
      setSuccessMsg(`Added ${ruleIds.length} rule(s) to structure.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to add rules');
    } finally {
      setSubmitting(false);
      setIsRulePickerOpen(false);
    }
  };

  const handleRemoveRule = async (ruleId) => {
    if (!window.confirm('Remove this rule from the structure?')) return;
    try {
      setSubmitting(true);
      await deleteRule(ruleId);
      setAssignedRules((prev) => prev.filter((r) => r.id !== ruleId));
      setSuccessMsg('Salary rule removed.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to remove rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Structure Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      await updateStructure(id, {
        name: formData.name.trim(),
        active: Boolean(formData.active),
      });
      setSuccessMsg('Salary structure saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save salary structure');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this salary structure?')) return;
    setDeleting(true);
    try {
      await deleteStructure(id);
      router.push('/payroll/structures');
    } catch (err) {
      setError(err.message || 'Failed to delete salary structure');
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
              { label: 'Salary Structures', href: '/payroll/structures' },
              { label: formData.name || 'Structure' }
            ]}
            title={formData.name || 'Salary Structure'}
            subtitle={`${assignedRules.length} Rule(s) in Computation Sequence`}
            icon={<Layers className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                formData.active
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {formData.active ? 'Active' : 'Archived'}
              </span>
            }
            backHref="/payroll/structures"
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
              <p className="text-sm">Loading structure and salary rules...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Structure Metadata */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Structure Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Structure Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!canManage}
                      required
                      placeholder="e.g. Standard Full-Time Structure"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        disabled={!canManage}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-800">
                        Active for Contract Assignments
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Salary Rules Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      Salary Rules & Computation Sequence
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rules are evaluated sequentially based on sequence number during payroll batch runs.
                    </p>
                  </div>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsRulePickerOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add / Pick Rules</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Seq</th>
                        <th className="px-4 py-3">Rule Name</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Computation Method</th>
                        {canManage && <th className="px-4 py-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {assignedRules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs">
                            No rules assigned to this structure. Click "Add / Pick Rules" to assign rules.
                          </td>
                        </tr>
                      ) : (
                        assignedRules.map((rule, idx) => (
                          <tr key={rule.id || idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-slate-600 text-xs">
                              {rule.sequence ?? idx + 1}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <Link
                                href={`/payroll/rules/${rule.id}`}
                                className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                              >
                                <span>{rule.name}</span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                              </Link>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-indigo-700 font-bold">
                              {rule.code}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                                {rule.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-600">
                              {rule.amountType === 'percentage'
                                ? `${rule.percentage}% of ${rule.percentageBase || 'BASE'}`
                                : rule.amountType === 'fixed'
                                ? `Fixed Amount ($${rule.fixedAmount})`
                                : rule.amountType === 'python'
                                ? 'Python Expression'
                                : rule.amountType || 'Fixed'}
                            </td>
                            {canManage && (
                              <td className="px-4 py-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveRule(rule.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Remove rule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          )}

          {/* Salary Rule Picker Modal */}
          <SalaryRulePickerModal
            isOpen={isRulePickerOpen}
            onClose={() => setIsRulePickerOpen(false)}
            onSelectRules={handleRulesSelectedFromPicker}
            fetchAvailableRuleOptions={fetchAvailableRuleOptions}
            alreadyAssignedCodes={assignedRules.map((r) => r.code)}
          />
        </main>
      </div>
    </div>
  );
}

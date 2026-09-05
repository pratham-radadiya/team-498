'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import {
  X,
  Layers,
  Save,
  Trash2,
  AlertCircle,
  Plus,
  FileCode,
  ListFilter,
  CheckCircle2
} from 'lucide-react';
import SalaryRulePickerModal from './SalaryRulePickerModal';
import { formatCurrency } from '@/lib/formatters';

export default function SalaryStructureFormModal({
  isOpen,
  onClose,
  structureId,
  fetchStructureById,
  createStructure,
  updateStructure,
  addRulesToStructure,
  deleteStructure,
  deleteRule,
  fetchAvailableRuleOptions,
  currentUserRole,
  onSuccess,
  onAddRule,
}) {
  const isCreate = !structureId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canManage = canPerformAction(currentUserRole, 'salaryStructures', 'edit');

  const [formData, setFormData] = useState({
    name: '',
    active: true,
  });
  const [assignedRules, setAssignedRules] = useState([]);
  const [isRulePickerOpen, setIsRulePickerOpen] = useState(false);

  useEffect(() => {
    if (isOpen && structureId) {
      setLoading(true);
      setError('');
      fetchStructureById(structureId)
        .then((data) => {
          setFormData({
            name: data.name || '',
            active: data.active ?? true,
          });
          setAssignedRules(data.rules || []);
        })
        .catch((err) => setError(err.message || 'Failed to load structure details'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
        name: '',
        active: true,
      });
      setAssignedRules([]);
      setError('');
    }
  }, [isOpen, structureId, isCreate, fetchStructureById]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleRulesSelectedFromPicker = async (selectedRuleObjects) => {
    if (!selectedRuleObjects || selectedRuleObjects.length === 0) return;

    if (isCreate) {
      // In create mode, accumulate chosen rules locally
      setAssignedRules((prev) => {
        const existingCodes = new Set(prev.map((r) => r.code?.toUpperCase()));
        const newlyAdded = selectedRuleObjects.filter(
          (r) => !existingCodes.has(r.code?.toUpperCase())
        );
        return [...prev, ...newlyAdded].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      });
    } else {
      // In edit mode, persist directly via backend addRulesToStructure API
      try {
        setSubmitting(true);
        const ruleIds = selectedRuleObjects.map((r) => r.id);
        const updated = await addRulesToStructure(structureId, ruleIds);
        setAssignedRules(updated.rules || []);
      } catch (err) {
        setError(err.message || 'Failed to add rules to salary structure.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRemoveAssignedRule = async (ruleToRemove, index) => {
    if (isCreate) {
      // In create mode, simply remove from local array
      setAssignedRules((prev) => prev.filter((_, idx) => idx !== index));
    } else {
      // In edit mode, delete rule from DB
      if (confirm(`Are you sure you want to remove "${ruleToRemove.name}" from this structure?`)) {
        try {
          setSubmitting(true);
          if (deleteRule && ruleToRemove.id) {
            await deleteRule(ruleToRemove.id);
            setAssignedRules((prev) => prev.filter((r) => r.id !== ruleToRemove.id));
          }
        } catch (err) {
          setError(err.message || 'Failed to remove rule.');
        } finally {
          setSubmitting(false);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Structure Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        active: Boolean(formData.active),
      };

      if (isCreate) {
        payload.ruleIds = assignedRules.map((r) => r.id).filter(Boolean);
        await createStructure(payload);
      } else {
        await updateStructure(structureId, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save salary structure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this salary structure?')) {
      try {
        setSubmitting(true);
        await deleteStructure(structureId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete structure.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Basic':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Allowance':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Gross':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'Deduction':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Net':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const renderComputationDetails = (rule) => {
    if (rule.computationMethod === 'Fixed') {
      return (
        <span className="font-mono font-bold text-slate-800">
          Fixed: {formatCurrency(rule.fixedAmount || 0)}
        </span>
      );
    }
    if (rule.computationMethod === 'Percentage') {
      return (
        <span className="font-mono font-semibold text-slate-700">
          {rule.percentageValue}% of {rule.percentageBase || 'ContractWage'}
        </span>
      );
    }
    if (rule.computationMethod === 'Formula') {
      return (
        <span className="font-mono text-[11px] text-indigo-700 font-medium truncate max-w-xs block" title={rule.formula}>
          {rule.formula}
        </span>
      );
    }
    return <span className="text-slate-400">—</span>;
  };

  const inputClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {isCreate ? 'Create Salary Structure' : 'Edit Salary Structure'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Define structure name, active state, and assigned computation rules
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
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
              <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading structure details...</div>
            ) : (
              <div className="space-y-6">
                {/* Structure Name */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Structure Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Standard Full-Time Structure, Executive Salary Structure"
                    required
                    disabled={!canManage}
                    className={`${inputClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                  />
                </div>

                {/* Active Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Active Salary Structure</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Only active structures are available for employment contract assignment and payruns.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    disabled={!canManage}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Salary Rules Selection & Table Section (Available on BOTH Create & Edit) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4.5 h-4.5 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">
                          Assigned Salary Rules ({assignedRules.length})
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isCreate
                          ? 'Select existing salary rules from library to initialize this structure'
                          : 'Rules executed sequentially during payslip computation'}
                      </p>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-2">
                        {/* Select from Library */}
                        <button
                          type="button"
                          onClick={() => setIsRulePickerOpen(true)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                        >
                          <ListFilter className="w-3.5 h-3.5" />
                          <span>Select Rules to Add</span>
                        </button>

                        {/* Create Custom Rule (Edit mode) */}
                        {!isCreate && onAddRule && (
                          <button
                            type="button"
                            onClick={() => onAddRule(structureId)}
                            className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Custom</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {assignedRules.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-3">
                      <FileCode className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-700">No salary rules assigned yet</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Click "Select Rules to Add" to pick from existing Basic, Allowance, Gross, Deduction, and Net rules.
                        </p>
                      </div>
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => setIsRulePickerOpen(true)}
                          className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Select Rules from Library</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3 w-14">Seq</th>
                            <th className="py-2.5 px-3">Rule Name</th>
                            <th className="py-2.5 px-3">Code</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Computation</th>
                            {canManage && <th className="py-2.5 px-3 text-right w-16">Action</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignedRules.map((rule, idx) => (
                            <tr key={rule.id || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{rule.sequence}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{rule.name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-700 font-bold">{rule.code}</td>
                              <td className="py-2.5 px-3">
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getCategoryBadgeClass(rule.category)}`}>
                                  {rule.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700">
                                {renderComputationDetails(rule)}
                              </td>
                              {canManage && (
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAssignedRule(rule, idx)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                    title="Remove Rule from Structure"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Structure</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                Cancel
              </button>
              {canManage && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{isCreate ? `Create Structure (${assignedRules.length} Rules)` : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Rule Picker Modal */}
      <SalaryRulePickerModal
        isOpen={isRulePickerOpen}
        onClose={() => setIsRulePickerOpen(false)}
        onSelectRules={handleRulesSelectedFromPicker}
        alreadyAssignedCodes={assignedRules.map((r) => r.code)}
        fetchAvailableRuleOptions={fetchAvailableRuleOptions}
      />
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { X, Layers, Save, Trash2, AlertCircle, Plus, FileCode } from 'lucide-react';

export default function SalaryStructureFormModal({
  isOpen,
  onClose,
  structureId,
  fetchStructureById,
  createStructure,
  updateStructure,
  deleteStructure,
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

  const inputClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
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

              {/* Salary Rules Table Section (Edit mode only) */}
              {!isCreate && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">Assigned Salary Rules (Sequenced)</h3>
                    </div>
                    {canManage && onAddRule && (
                      <button
                        type="button"
                        onClick={() => onAddRule(structureId)}
                        className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Salary Rule</span>
                      </button>
                    )}
                  </div>

                  {assignedRules.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500 font-medium">
                      No rules configured for this structure yet. Click "Add Salary Rule" to add Basic, Allowance, or Deduction rules.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-2.5 px-3">Seq</th>
                            <th className="py-2.5 px-3">Rule Name</th>
                            <th className="py-2.5 px-3">Code</th>
                            <th className="py-2.5 px-3">Category</th>
                            <th className="py-2.5 px-3">Computation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {assignedRules.map((rule) => (
                            <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{rule.sequence}</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">{rule.name}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{rule.code}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                                  {rule.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 font-medium">{rule.computationMethod}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                <span>Delete Structure</span>
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
                    <span>{isCreate ? 'Create Structure' : 'Save Changes'}</span>
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

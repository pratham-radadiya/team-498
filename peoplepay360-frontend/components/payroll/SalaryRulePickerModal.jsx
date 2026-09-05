'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  CheckSquare,
  Square,
  FileCode,
  Layers,
  Plus,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

const CATEGORIES = ['All', 'Basic', 'Allowance', 'Gross', 'Deduction', 'Net'];

export default function SalaryRulePickerModal({
  isOpen,
  onClose,
  onSelectRules,
  alreadyAssignedCodes = [],
  fetchAvailableRuleOptions,
}) {
  const [loading, setLoading] = useState(false);
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError('');
      setSelectedRuleIds(new Set());
      setSearchQuery('');
      setSelectedCategory('All');

      if (fetchAvailableRuleOptions) {
        fetchAvailableRuleOptions()
          .then((data) => {
            setAvailableRules(data || []);
          })
          .catch((err) => {
            setError(err.message || 'Failed to load available salary rules');
          })
          .finally(() => setLoading(false));
      }
    }
  }, [isOpen, fetchAvailableRuleOptions]);

  const assignedCodeSet = useMemo(
    () => new Set(alreadyAssignedCodes.map((c) => String(c).toUpperCase())),
    [alreadyAssignedCodes]
  );

  // Filter rules by search query and category
  const filteredRules = useMemo(() => {
    return availableRules.filter((rule) => {
      const matchesCategory =
        selectedCategory === 'All' || rule.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        rule.name?.toLowerCase().includes(q) ||
        rule.code?.toLowerCase().includes(q) ||
        rule.structureName?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [availableRules, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const toggleSelectRule = (ruleId, isAlreadyAssigned) => {
    if (isAlreadyAssigned) return;
    setSelectedRuleIds((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) {
        next.delete(ruleId);
      } else {
        next.add(ruleId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const selectable = filteredRules.filter(
      (r) => !assignedCodeSet.has(r.code?.toUpperCase())
    );
    setSelectedRuleIds(new Set(selectable.map((r) => r.id)));
  };

  const handleDeselectAll = () => {
    setSelectedRuleIds(new Set());
  };

  const handleConfirm = () => {
    const selectedObjects = availableRules.filter((r) =>
      selectedRuleIds.has(r.id)
    );
    onSelectRules(selectedObjects);
    onClose();
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
        <span className="font-mono text-xs text-indigo-700 font-medium truncate max-w-xs block" title={rule.formula}>
          Formula: {rule.formula}
        </span>
      );
    }
    return <span className="text-slate-400">—</span>;
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/25 shrink-0">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Select Salary Rules
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose from available system salary rules to attach to this structure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar (Search & Category filters) */}
        <div className="p-6 border-b border-slate-100 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rule by name, code, or source structure..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/15 outline-none transition-all"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rule List Body */}
        <div className="flex-1 overflow-y-auto p-6 max-h-[50vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs font-semibold mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              Loading available salary rules...
            </div>
          ) : filteredRules.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-medium">
              No salary rules matched your criteria.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 w-10">Select</th>
                    <th className="py-3 px-3 w-16">Seq</th>
                    <th className="py-3 px-4">Rule Name</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-4">Computation</th>
                    <th className="py-3 px-3">Source Structure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRules.map((rule) => {
                    const isAlreadyAssigned = assignedCodeSet.has(
                      rule.code?.toUpperCase()
                    );
                    const isSelected = selectedRuleIds.has(rule.id);

                    return (
                      <tr
                        key={rule.id}
                        onClick={() => toggleSelectRule(rule.id, isAlreadyAssigned)}
                        className={`transition-colors cursor-pointer select-none ${
                          isAlreadyAssigned
                            ? 'bg-slate-50/60 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-indigo-50/60 hover:bg-indigo-50'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={isAlreadyAssigned}
                            onChange={() => {}}
                            className="w-4 h-4 accent-indigo-600 rounded cursor-pointer pointer-events-none"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                          {rule.sequence}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{rule.name}</span>
                            {isAlreadyAssigned && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                                Assigned
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-bold">
                          {rule.code}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getCategoryBadgeClass(
                              rule.category
                            )}`}
                          >
                            {rule.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {renderComputationDetails(rule)}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {rule.structureName || 'Global'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{selectedRuleIds.size} rule(s) selected</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={selectedRuleIds.size === 0}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Selected Rules ({selectedRuleIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

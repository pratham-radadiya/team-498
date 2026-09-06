'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import SalaryRuleList from '@/components/payroll/SalaryRuleList';
import SalaryRuleFormModal from '@/components/payroll/SalaryRuleFormModal';
import { useSalaryRules } from '@/hooks/useSalaryRules';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import { FileCode, Plus, RefreshCw, Layers, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SalaryRulesPage() {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const canManage = canPerformAction(currentUserRole, 'salaryRules', 'create');

  const {
    rules,
    totalCount,
    loading,
    fetchRules,
    fetchRuleById,
    createRule,
    updateRule,
    deleteRule,
  } = useSalaryRules();

  const { fetchStructureOptions } = useSalaryStructures();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [structureFilter, setStructureFilter] = useState('');

  const [structureOptions, setStructureOptions] = useState([]);

  useEffect(() => {
    const startRow = (page - 1) * pageSize;
    fetchRules({ startRow, endRow: page * pageSize });
  }, [page, pageSize, gridRefreshTrigger, fetchRules]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await fetchStructureOptions();
        setStructureOptions(opts || []);
      } catch (err) {
        console.error('Failed to load structure options for rules page:', err);
      }
    };

    loadOptions();
  }, [fetchStructureOptions]);

  const handleOpenCreateModal = () => {
    setSelectedRuleId(null);
    setIsModalOpen(true);
  };

  const handleSelectRule = (id) => {
    router.push(`/payroll/rules/${id}`);
  };

  const handleModalSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  const filteredRules = rules.filter((rule) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      rule.name?.toLowerCase().includes(query) ||
      rule.code?.toLowerCase().includes(query) ||
      rule.category?.toLowerCase().includes(query) ||
      rule.structureName?.toLowerCase().includes(query);

    const matchesCategory = !categoryFilter || rule.category === categoryFilter;
    const matchesStructure = !structureFilter || rule.structureId === structureFilter;

    return matchesSearch && matchesCategory && matchesStructure;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Salary Rules" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <FileCode className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Salary Rules</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Define rules for Basic, Allowances, Gross, Deductions, and Net salary computations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/payroll/structures"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Structures</span>
              </Link>

              <button
                onClick={() => setGridRefreshTrigger((prev) => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs"
                title="Refresh Table"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Salary Rule</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80 md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by rule name, code, category..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3.5 py-2">
                <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">All Categories</option>
                  <option value="Basic">Basic</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Gross">Gross</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Net">Net</option>
                </select>
              </div>

              {structureOptions.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3.5 py-2">
                  <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Structure:</span>
                  <select
                    value={structureFilter}
                    onChange={(e) => setStructureFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Structures</option>
                    {structureOptions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name || s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
                Showing <span className="text-indigo-600 font-extrabold">{filteredRules.length}</span> of {totalCount || filteredRules.length} records
              </span>
            </div>
          </div>

          {/* Rules AG Grid Table */}
          <SalaryRuleList
            rules={filteredRules}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onSelectRule={handleSelectRule}
          />
        </div>
      </main>

      {/* Rule Form Modal */}
      <SalaryRuleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ruleId={selectedRuleId}
        fetchRuleById={fetchRuleById}
        createRule={createRule}
        updateRule={updateRule}
        deleteRule={deleteRule}
        structureOptions={structureOptions}
        currentUserRole={currentUserRole}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

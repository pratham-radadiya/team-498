'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import SalaryStructureList from '@/components/payroll/SalaryStructureList';
import SalaryStructureFormModal from '@/components/payroll/SalaryStructureFormModal';
import SalaryRuleFormModal from '@/components/payroll/SalaryRuleFormModal';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useSalaryRules } from '@/hooks/useSalaryRules';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import { Layers, Plus, RefreshCw, FileCode } from 'lucide-react';
import Link from 'next/link';

export default function SalaryStructuresPage() {
  const { role: currentUserRole } = useAuthSession();
  const canManage = canPerformAction(currentUserRole, 'salaryStructures', 'create');

  const {
    fetchStructureById,
    fetchStructureOptions,
    createStructure,
    updateStructure,
    deleteStructure,
  } = useSalaryStructures();

  const {
    fetchRuleById,
    createRule,
    updateRule,
    deleteRule,
  } = useSalaryRules();

  const [isStructModalOpen, setIsStructModalOpen] = useState(false);
  const [selectedStructureId, setSelectedStructureId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Embedded Rule Modal State
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleStructureId, setRuleStructureId] = useState(null);
  const [structureOptions, setStructureOptions] = useState([]);

  const loadStructuresOptions = async () => {
    try {
      const opts = await fetchStructureOptions();
      setStructureOptions(opts);
    } catch (err) {
      console.error('Failed to load structure options:', err);
    }
  };

  useEffect(() => {
    loadStructuresOptions();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedStructureId(null);
    setIsStructModalOpen(true);
  };

  const handleSelectStructure = (id) => {
    setSelectedStructureId(id);
    setIsStructModalOpen(true);
  };

  const handleOpenAddRuleModal = (structId) => {
    setRuleStructureId(structId);
    setIsRuleModalOpen(true);
  };

  const handleStructSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
    loadStructuresOptions();
  };

  const handleRuleSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Salary Structures" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Layers className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Salary Structures</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Configure structure templates and assigned computation rules
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/payroll/rules"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <FileCode className="w-4 h-4 text-slate-500" />
                <span>Salary Rules</span>
              </Link>

              <button
                onClick={() => setGridRefreshTrigger((prev) => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs"
                title="Refresh Table"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Structure</span>
                </button>
              )}
            </div>
          </div>

          {/* Structure AG Grid Table */}
          <SalaryStructureList
            refreshTrigger={gridRefreshTrigger}
            onSelectStructure={handleSelectStructure}
          />
        </div>
      </main>

      {/* Structure Form Modal */}
      <SalaryStructureFormModal
        isOpen={isStructModalOpen}
        onClose={() => setIsStructModalOpen(false)}
        structureId={selectedStructureId}
        fetchStructureById={fetchStructureById}
        createStructure={createStructure}
        updateStructure={updateStructure}
        deleteStructure={deleteStructure}
        currentUserRole={currentUserRole}
        onSuccess={handleStructSuccess}
        onAddRule={handleOpenAddRuleModal}
      />

      {/* Embedded Salary Rule Modal */}
      <SalaryRuleFormModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        ruleId={null}
        preselectedStructureId={ruleStructureId}
        fetchRuleById={fetchRuleById}
        createRule={createRule}
        updateRule={updateRule}
        deleteRule={deleteRule}
        structureOptions={structureOptions}
        currentUserRole={currentUserRole}
        onSuccess={handleRuleSuccess}
      />
    </div>
  );
}

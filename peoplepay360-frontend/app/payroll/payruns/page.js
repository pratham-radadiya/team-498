'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PayrunList from '@/components/payroll/PayrunList';
import PayrunWizardModal from '@/components/payroll/PayrunWizardModal';
import { usePayruns } from '@/hooks/usePayruns';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import { CreditCard, Plus, RefreshCw, FileText, Search } from 'lucide-react';
import Link from 'next/link';

export default function PayrunsPage() {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const canManage = canPerformAction(currentUserRole, 'payruns', 'create');

  const {
    payruns,
    totalCount,
    loading,
    fetchPayruns,
    fetchEligibleEmployees,
    createPayrun,
  } = usePayruns();

  const { fetchStructureOptions } = useSalaryStructures();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Wizard modal state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [structureOptions, setStructureOptions] = useState([]);

  const loadPayruns = useCallback(() => {
    const startRow = (page - 1) * pageSize;
    const endRow = page * pageSize;
    fetchPayruns({ startRow, endRow });
  }, [page, pageSize, fetchPayruns]);

  useEffect(() => {
    loadPayruns();
  }, [loadPayruns, gridRefreshTrigger]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await fetchStructureOptions();
        setStructureOptions(opts || []);
      } catch (err) {
        console.error('Failed to load structure options for payruns page:', err);
      }
    };

    loadOptions();
  }, [fetchStructureOptions]);

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleSelectPayrun = (id) => {
    router.push(`/payroll/payruns/${id}`);
  };

  const handleWizardSuccess = (newId) => {
    setGridRefreshTrigger((prev) => prev + 1);
    setIsWizardOpen(false);
    if (newId) {
      router.push(`/payroll/payruns/${newId}`);
    }
  };

  const handleRefetch = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  const filteredPayruns = payruns.filter((run) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = run.name || '';
    const status = run.status || '';
    return name.toLowerCase().includes(q) || status.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <Header
        title="Payruns Batch Processing"
        onMobileToggle={() => setMobileSidebarOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payruns</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Batch creation, compute salary rules, validate, mark paid, and email PDF payslips
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/payroll/payslips"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Payslips</span>
              </Link>

              <button
                onClick={handleRefetch}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenWizard}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-sm shadow-indigo-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Payrun</span>
                </button>
              )}
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80 md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payrun batches..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">
              Showing <span className="text-indigo-600 font-extrabold">{filteredPayruns.length}</span> of {totalCount || filteredPayruns.length} payruns
            </span>
          </div>

          {/* Payruns AG Grid Table with Pagination */}
          <PayrunList
            payruns={filteredPayruns}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onSelectPayrun={handleSelectPayrun}
          />
        </div>
      </main>

      {/* Payrun Generation Wizard Modal */}
      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        createPayrun={createPayrun}
        fetchEligibleEmployees={fetchEligibleEmployees}
        structureOptions={structureOptions}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
}

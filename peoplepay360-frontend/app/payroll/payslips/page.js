'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PayslipList from '@/components/payroll/PayslipList';
import { usePayslips } from '@/hooks/usePayslips';
import { useAuthSession } from '@/hooks/useAuthSession';
import { FileText, RefreshCw, CreditCard, Search } from 'lucide-react';
import Link from 'next/link';

export default function PayslipsPage() {
  const router = useRouter();
  const { role: currentUserRole, employeeId: currentEmployeeId } = useAuthSession();

  // EMPLOYEE role sees only their own payslips (automatically enforced by server-side API scoping too)
  const isEmployeeRole = currentUserRole === 'EMPLOYEE';
  const employeeFilter = isEmployeeRole ? currentEmployeeId : null;

  const { payslips, totalCount, loading, fetchPayslips, downloadPdf } = usePayslips();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  const loadData = useCallback(() => {
    const startRow = (page - 1) * pageSize;
    const endRow = page * pageSize;
    const filterModel = {};
    if (employeeFilter) {
      filterModel.employeeId = { filterType: 'text', type: 'equals', filter: employeeFilter };
    }
    fetchPayslips({ startRow, endRow, filterModel });
  }, [page, pageSize, employeeFilter, fetchPayslips]);

  useEffect(() => {
    loadData();
  }, [loadData, gridRefreshTrigger]);

  const handleSelectPayslip = (id) => {
    router.push(`/payroll/payslips/${id}`);
  };

  const handleRefetch = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  const filteredPayslips = payslips.filter((slip) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const empName = slip.employeeName || slip.employee?.name || '';
    const ref = slip.contractReference || slip.contract?.contractReference || '';
    const status = slip.status || '';
    return (
      empName.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q) ||
      status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <Header
        title="Employee Payslips"
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
                  <FileText className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {isEmployeeRole ? 'My Payslips' : 'Employee Payslips'}
                </h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                {isEmployeeRole
                  ? 'View your calculated monthly payslips and download PDF statements'
                  : 'Inspect salary computation breakdown and print PDF payslips across all payruns'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!isEmployeeRole && (
                <Link
                  href="/payroll/payruns"
                  className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Payruns</span>
                </Link>
              )}

              <button
                onClick={handleRefetch}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs cursor-pointer"
                title="Refresh Table"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
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
                placeholder="Search by employee, contract, status..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
              />
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl">
              Showing <span className="text-indigo-600 font-extrabold">{filteredPayslips.length}</span> of {totalCount || filteredPayslips.length} payslips
            </span>
          </div>

          {/* Payslips AG Grid Table with Pagination */}
          <PayslipList
            payslips={filteredPayslips}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onSelectPayslip={handleSelectPayslip}
            onDownloadPdf={downloadPdf}
          />
        </div>
      </main>
    </div>
  );
}

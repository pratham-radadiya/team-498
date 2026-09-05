'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PayslipList from '@/components/payroll/PayslipList';
import PayslipDetailModal from '@/components/payroll/PayslipDetailModal';
import { usePayslips } from '@/hooks/usePayslips';
import { useAuthSession } from '@/hooks/useAuthSession';
import { FileText, RefreshCw, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function PayslipsPage() {
  const { role: currentUserRole, employeeId: currentEmployeeId } = useAuthSession();

  // EMPLOYEE role sees only their own payslips (automatically enforced by server-side API scoping too)
  const isEmployeeRole = currentUserRole === 'EMPLOYEE';
  const employeeFilter = isEmployeeRole ? currentEmployeeId : null;

  const { fetchPayslipById, getPdfUrl, downloadPdf, deletePayslip } = usePayslips();

  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);

  const handleSelectPayslip = (id) => {
    setSelectedPayslipId(id);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Employee Payslips" />

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
                onClick={() => setGridRefreshTrigger((prev) => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs"
                title="Refresh Table"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Payslips AG Grid Table */}
          <PayslipList
            refreshTrigger={gridRefreshTrigger}
            onSelectPayslip={handleSelectPayslip}
            employeeIdFilter={employeeFilter}
          />
        </div>
      </main>

      {/* Payslip Detail & Print Modal */}
      <PayslipDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        payslipId={selectedPayslipId}
        fetchPayslipById={fetchPayslipById}
        getPdfUrl={getPdfUrl}
        downloadPdf={downloadPdf}
        deletePayslip={deletePayslip}
        currentUserRole={currentUserRole}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

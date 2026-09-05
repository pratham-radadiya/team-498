'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PayrunList from '@/components/payroll/PayrunList';
import PayrunWizardModal from '@/components/payroll/PayrunWizardModal';
import PayrunDetailModal from '@/components/payroll/PayrunDetailModal';
import PayslipDetailModal from '@/components/payroll/PayslipDetailModal';
import { usePayruns } from '@/hooks/usePayruns';
import { usePayslips } from '@/hooks/usePayslips';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import { CreditCard, Plus, RefreshCw, FileText } from 'lucide-react';
import Link from 'next/link';

export default function PayrunsPage() {
  const { role: currentUserRole } = useAuthSession();
  const canManage = canPerformAction(currentUserRole, 'payruns', 'create');

  const {
    fetchEligibleEmployees,
    fetchPayrunById,
    createPayrun,
    computePayrun,
    validatePayrun,
    markPaid,
    sendPayslips,
    deletePayrun,
  } = usePayruns();

  const { fetchPayslipById, getPdfUrl, downloadPdf, deletePayslip } = usePayslips();
  const { fetchStructureOptions } = useSalaryStructures();

  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Modals state
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPayrunDetailOpen, setIsPayrunDetailOpen] = useState(false);
  const [selectedPayrunId, setSelectedPayrunId] = useState(null);

  const [isPayslipDetailOpen, setIsPayslipDetailOpen] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);

  const [structureOptions, setStructureOptions] = useState([]);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await fetchStructureOptions();
        setStructureOptions(opts);
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
    setSelectedPayrunId(id);
    setIsPayrunDetailOpen(true);
  };

  const handleSelectPayslipFromPayrun = (id) => {
    setSelectedPayslipId(id);
    setIsPayslipDetailOpen(true);
  };

  const handleWizardSuccess = (newId) => {
    setGridRefreshTrigger((prev) => prev + 1);
    setSelectedPayrunId(newId);
    setIsPayrunDetailOpen(true);
  };

  const handlePayrunDetailSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Payruns Batch Processing" />

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
                onClick={() => setGridRefreshTrigger((prev) => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs"
                title="Refresh Table"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {canManage && (
                <button
                  onClick={handleOpenWizard}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Payrun</span>
                </button>
              )}
            </div>
          </div>

          {/* Payruns AG Grid Table */}
          <PayrunList
            refreshTrigger={gridRefreshTrigger}
            onSelectPayrun={handleSelectPayrun}
          />
        </div>
      </main>

      {/* Payrun Creation Wizard Modal */}
      <PayrunWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        fetchEligibleEmployees={fetchEligibleEmployees}
        createPayrun={createPayrun}
        structureOptions={structureOptions}
        onSuccess={handleWizardSuccess}
      />

      {/* Payrun Detail Modal */}
      <PayrunDetailModal
        isOpen={isPayrunDetailOpen}
        onClose={() => setIsPayrunDetailOpen(false)}
        payrunId={selectedPayrunId}
        fetchPayrunById={fetchPayrunById}
        computePayrun={computePayrun}
        validatePayrun={validatePayrun}
        markPaid={markPaid}
        sendPayslips={sendPayslips}
        deletePayrun={deletePayrun}
        currentUserRole={currentUserRole}
        onSelectPayslip={handleSelectPayslipFromPayrun}
        onSuccess={handlePayrunDetailSuccess}
      />

      {/* Payslip Detail Modal */}
      <PayslipDetailModal
        isOpen={isPayslipDetailOpen}
        onClose={() => {
          setIsPayslipDetailOpen(false);
          setSelectedPayslipId(null);
        }}
        payslipId={selectedPayslipId}
        fetchPayslipById={fetchPayslipById}
        getPdfUrl={getPdfUrl}
        downloadPdf={downloadPdf}
        deletePayslip={deletePayslip}
        currentUserRole={currentUserRole}
        onSuccess={handlePayrunDetailSuccess}
      />
    </div>
  );
}

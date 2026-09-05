'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthSession } from '@/hooks/useAuthSession';
import apiClient from '@/lib/api-client';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { CreditCard, Layers, FileCode, FileText, ArrowRight, Plus, AlertCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function PayrollDashboardPage() {
  const { session } = useAuthSession();
  const currentUserRole = session?.role || 'EMPLOYEE';

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayruns: 0,
    draftPayruns: 0,
    paidPayruns: 0,
    totalStructures: 0,
    totalRules: 0,
    totalPayslips: 0,
  });
  const [recentPayruns, setRecentPayruns] = useState([]);

  useEffect(() => {
    const fetchPayrollData = async () => {
      setLoading(true);
      try {
        const [payrunRes, structRes, payslipRes] = await Promise.all([
          apiClient.post('/api/payruns/list', { startRow: 0, endRow: 10 }),
          apiClient.post('/api/salary-structures/list', { startRow: 0, endRow: 50 }),
          apiClient.post('/api/payslips/list', { startRow: 0, endRow: 10 }),
        ]);

        const payrunRows = payrunRes.data?.rows || [];
        const payrunCount = payrunRes.data?.rowCount || payrunRows.length;
        const structRows = structRes.data?.rows || [];
        const payslipRows = payslipRes.data?.rows || [];
        const payslipCount = payslipRes.data?.rowCount || payslipRows.length;

        const draft = payrunRows.filter((p) => p.status === 'Draft').length;
        const paid = payrunRows.filter((p) => p.status === 'Paid').length;

        setStats({
          totalPayruns: payrunCount,
          draftPayruns: draft,
          paidPayruns: paid,
          totalStructures: structRows.length,
          totalRules: 0,
          totalPayslips: payslipCount,
        });

        setRecentPayruns(payrunRows.slice(0, 5));
      } catch (err) {
        console.error('Failed to load Payroll Dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayrollData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Payroll Overview" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payroll & Payslips</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Manage salary structures, computation rules, payrun batches, and employee payslips
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentUserRole !== 'EMPLOYEE' && currentUserRole !== 'HR_MANAGER' && (
                <Link
                  href="/payroll/payruns"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Payrun Batch</span>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Payruns</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.totalPayruns}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Draft Payruns</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.draftPayruns}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Salary Structures</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.totalStructures}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated Payslips</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.totalPayslips}</p>
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link
              href="/payroll/payruns"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Payruns
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Batch payroll creation, computing, validation, marking paid, and emailing PDF payslips.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Manage Payruns</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/payroll/payslips"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Payslips
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  View breakdown of basic, allowances, deductions, and gross/net salary with PDF download.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>View Payslips</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/payroll/structures"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Salary Structures
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Configure salary structures and assign them to employment contracts.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Manage Structures</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/payroll/rules"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Salary Rules
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Define Fixed, Percentage, and Custom Formula rule computations.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Manage Rules</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Recent Payruns Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Payruns</h2>
              <Link
                href="/payroll/payruns"
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All Payruns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm font-medium">Loading recent payruns...</div>
            ) : recentPayruns.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>No payruns found.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Payrun Name</th>
                      <th className="py-3 px-4">Pay Period</th>
                      <th className="py-3 px-4">Payslip Count</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentPayruns.map((pr) => (
                      <tr key={pr.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{pr.name}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(pr.periodStart)} → {formatDate(pr.periodEnd)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{pr.payslipCount || 0} Payslips</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              pr.status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : pr.status === 'Validated'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {pr.status || 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

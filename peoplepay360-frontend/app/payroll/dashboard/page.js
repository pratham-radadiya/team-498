'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PayrollDashboardView from '@/components/payroll/PayrollDashboardView';
import { CreditCard, LayoutDashboard } from 'lucide-react';

export default function PayrollDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Executive Payroll Dashboard</h1>
                <p className="text-xs text-slate-500">Cross-functional HR, Payroll, Attendance, and Time Off analytics</p>
              </div>
            </div>
          </div>

          {/* Payroll Dashboard View Component */}
          <PayrollDashboardView />
        </div>
      </main>
    </div>
  );
}

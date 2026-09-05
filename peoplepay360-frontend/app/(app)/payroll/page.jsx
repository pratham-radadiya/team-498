'use client';

import Link from 'next/link';
import { DollarSign, FileText, LayoutList, Settings } from 'lucide-react';

export default function PayrollPage() {
  const links = [
    { label: 'Payruns', href: '/payroll/payruns', icon: DollarSign, desc: 'Create, compute, and manage payroll runs', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Payslips', href: '/payroll/payslips', icon: FileText, desc: 'Browse and download individual payslips', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Salary Structures', href: '/payroll/structures', icon: LayoutList, desc: 'Configure salary components and rules', color: 'bg-violet-100 text-violet-600' },
    { label: 'Salary Rules', href: '/payroll/rules', icon: Settings, desc: 'Manage individual salary rules and formulas', color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
        <p className="text-slate-500 text-sm mt-1">End-to-end payroll processing: Structures → Rules → Payrun → Compute → Validate → Payslip</p>
      </div>

      {/* Flow diagram */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
        <h2 className="font-semibold text-slate-800 mb-3 text-sm">Payroll Workflow</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {['Salary Structure', '→', 'Salary Rules', '→', 'Contract', '→', 'Payrun', '→', 'Compute', '→', 'Validate', '→', 'Payslip'].map((step, i) => (
            step === '→' ? (
              <span key={i} className="text-indigo-400 font-bold text-sm">→</span>
            ) : (
              <span key={i} className="px-3 py-1.5 bg-white rounded-xl border border-indigo-200 text-xs font-semibold text-indigo-700 shadow-sm whitespace-nowrap">{step}</span>
            )
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${link.color}`}>
              <link.icon size={20} />
            </div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition">{link.label}</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

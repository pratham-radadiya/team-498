'use client';

import { useState } from 'react';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import {
  Building2, DollarSign, Calendar, Mail,
  ShieldCheck, Save, CheckCircle2
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    companyName: 'PeoplePay360 Inc.',
    taxId: 'US-EIN-98421049',
    currency: 'USD ($)',
    fiscalYearStart: 'January',
    standardWorkHours: '40',
    payrollCutoffDay: '25',
    payrollPayoutDay: '30',
    allowanceOvertimeMultiplier: '1.5',
    enableEmailPayslips: true,
    enableSelfServiceCheckIn: true,
    twoFactorEnforcement: false,
    auditLogRetentionDays: '365',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Company Settings</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure organizational parameters, payroll cycle defaults, currency, and security policies.
            </p>
          </div>
          {saved && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-200">
              <CheckCircle2 size={14} /> Settings Saved
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Organization Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-semibold text-base">
              <Building2 size={18} className="text-indigo-600" />
              <span>Company Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tax / Registration ID</label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Default Base Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>GBP (£)</option>
                  <option>INR (₹)</option>
                  <option>CAD ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fiscal Year Start Month</label>
                <select
                  value={formData.fiscalYearStart}
                  onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>January</option>
                  <option>April</option>
                  <option>July</option>
                  <option>October</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payroll Defaults */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-semibold text-base">
              <DollarSign size={18} className="text-emerald-600" />
              <span>Payroll & Compensation Engine Defaults</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Weekly Hours</label>
                <input
                  type="number"
                  value={formData.standardWorkHours}
                  onChange={(e) => setFormData({ ...formData, standardWorkHours: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Cutoff Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payrollCutoffDay}
                  onChange={(e) => setFormData({ ...formData, payrollCutoffDay: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disbursement Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payrollPayoutDay}
                  onChange={(e) => setFormData({ ...formData, payrollPayoutDay: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Security & Features */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-semibold text-base">
              <ShieldCheck size={18} className="text-amber-600" />
              <span>Security & Automation Switches</span>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/75 transition">
                <input
                  type="checkbox"
                  checked={formData.enableEmailPayslips}
                  onChange={(e) => setFormData({ ...formData, enableEmailPayslips: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-800">Automatic Email Payslip Delivery</div>
                  <div className="text-xs text-slate-500">Automatically dispatch password-protected PDF payslips upon payrun payout.</div>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/75 transition">
                <input
                  type="checkbox"
                  checked={formData.enableSelfServiceCheckIn}
                  onChange={(e) => setFormData({ ...formData, enableSelfServiceCheckIn: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="text-sm font-medium text-slate-800">Self-Service Attendance Clocking</div>
                  <div className="text-xs text-slate-500">Allow employees to clock in/out directly from their web portal header widget.</div>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
            >
              <Save size={16} />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '../../../src/context/AuthContext.jsx';
import { ROLE_LABELS } from '../../../src/lib/permissions.js';
import {
  User, Mail, Phone, MapPin, Building,
  Shield, CreditCard, Lock, CheckCircle2, Save
} from 'lucide-react';

export default function ProfilePage() {
  const { user, role } = useAuth();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || 'Arjun Mehta',
    email: user?.email || 'arjun.mehta@peoplepay360.com',
    phone: '+1 (555) 234-5678',
    address: '450 Mission St, San Francisco, CA 94105',
    emergencyContact: 'Priya Mehta (+1 555-987-6543)',
    bankName: 'Silicon Valley Bank',
    bankAccount: '••••••••4892',
    routingNumber: '121140399',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Profile & Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal profile details, emergency contacts, and direct deposit account.
          </p>
        </div>
        {saved && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-200">
            <CheckCircle2 size={14} /> Profile Saved
          </div>
        )}
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-indigo-600/20">
          {formData.name.charAt(0)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {ROLE_LABELS[role] || role}
            </span>
          </div>
          <p className="text-xs text-slate-500">{formData.email}</p>
          <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-3 mt-1">
            <span>Employee ID: {user?.employeeId || 'EMP001'}</span>
            <span>•</span>
            <span>Status: Active</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-slate-900 text-sm">
            <User size={18} className="text-indigo-600" />
            <span>Personal Information</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Banking & Payroll Direct Deposit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-semibold text-slate-900 text-sm">
            <CreditCard size={18} className="text-emerald-600" />
            <span>Direct Deposit Payout Account</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Routing Transit Code</label>
              <input
                type="text"
                value={formData.routingNumber}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition shadow-sm"
          >
            <Save size={16} />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}

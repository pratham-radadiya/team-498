'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useEmployees } from '@/hooks/useEmployees';
import { ROLES, ROLE_LABELS } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  User,
  FileText,
  Clock,
  Calendar,
  Layers,
  CreditCard,
  Save,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  Building,
  Mail,
  MapPin,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function EmployeeDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole, employeeId: currentUserId } = useAuthSession();
  const {
    fetchEmployeeById,
    updateEmployee,
    deleteEmployee,
    fetchOptions,
    options
  } = useEmployees();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'private'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.EMPLOYEE,
    status: 'Active',
    department: '',
    jobPosition: '',
    workLocation: '',
    company: '',
    bankAccount: '',
    workingScheduleId: '',
    managerId: '',
  });

  const [smartCounts, setSmartCounts] = useState({
    contracts: 0,
    attendance: 0,
    timeOff: 0,
    allocations: 0,
  });

  const isAdmin = currentUserRole === ROLES.ADMIN;
  const isEditingSelf = id === currentUserId;
  const canEditRole = isAdmin && !isEditingSelf;

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      await fetchOptions();
      const data = await fetchEmployeeById(id);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        password: '',
        role: data.role || ROLES.EMPLOYEE,
        status: data.status || 'Active',
        department: data.department || '',
        jobPosition: data.jobPosition || '',
        workLocation: data.workLocation || '',
        company: data.company || '',
        bankAccount: data.bankAccount || '',
        workingScheduleId: data.workingScheduleId || '',
        managerId: data.managerId || '',
      });
      if (data.smartButtonCounts) {
        setSmartCounts(data.smartButtonCounts);
      }
    } catch (err) {
      setError(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchEmployeeById, fetchOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setError('Name and Email are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      if (!payload.managerId) payload.managerId = null;
      if (!payload.workingScheduleId) payload.workingScheduleId = null;

      await updateEmployee(id, payload);
      setSuccessMsg('Employee details updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update employee details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isEditingSelf) {
      alert('You cannot delete your own account.');
      return;
    }

    const confirmMsg = 'Are you sure you want to delete this employee? This action cannot be undone.';
    if (!window.confirm(confirmMsg)) return;

    setDeleting(true);
    setError('');

    try {
      await deleteEmployee(id);
      router.push('/employees');
    } catch (err) {
      setError(err.message || 'Failed to delete employee.');
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex relative overflow-x-hidden font-sans antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-20 px-4 sm:px-6 pb-8 space-y-4 overflow-y-auto custom-scrollbar">
          <DetailPageHeader
            breadcrumbs={[
              { label: 'Employees', href: '/employees' },
              { label: formData.name || 'Employee Detail' }
            ]}
            title={formData.name || 'Employee Details'}
            subtitle={formData.jobPosition ? `${formData.jobPosition} • ${formData.department || 'General'}` : formData.email}
            icon={<User className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                formData.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {formData.status}
              </span>
            }
            backHref="/employees"
            actions={
              <div className="flex items-center gap-2">
                {isAdmin && !isEditingSelf && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || submitting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={submitting || loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            }
          />

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-sm">Loading employee profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Smart Navigation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  href={`/contracts?employeeId=${id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 flex items-center gap-3 transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-tight">
                      {smartCounts.contracts}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Contracts</div>
                  </div>
                </Link>

                <Link
                  href={`/attendance?employeeId=${id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 flex items-center gap-3 transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-tight">
                      {smartCounts.attendance}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Attendance</div>
                  </div>
                </Link>

                <Link
                  href={`/time-off/requests?employeeId=${id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 flex items-center gap-3 transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-tight">
                      {smartCounts.timeOff}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Time Off</div>
                  </div>
                </Link>

                <Link
                  href={`/time-off/allocations?employeeId=${id}`}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-3.5 flex items-center gap-3 transition-all group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-tight">
                      {smartCounts.allocations}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">Allocations</div>
                  </div>
                </Link>
              </div>

              {/* Main Profile Tabs */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 px-6 pt-2 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setActiveTab('work')}
                    className={`pb-3 pt-2 text-sm font-semibold border-b-2 mr-6 transition-colors ${
                      activeTab === 'work'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Work Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('private')}
                    className={`pb-3 pt-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === 'private'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Private & Security Information
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'work' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Work Details */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-indigo-600" />
                            Job Profile
                          </h3>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Job Position
                            </label>
                            <input
                              type="text"
                              name="jobPosition"
                              value={formData.jobPosition}
                              onChange={handleChange}
                              placeholder="e.g. Senior Software Engineer"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Department
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              placeholder="e.g. Engineering"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Reporting Manager
                            </label>
                            <select
                              name="managerId"
                              value={formData.managerId}
                              onChange={handleChange}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                              <option value="">-- None / Top Level --</option>
                              {(options?.managers || []).map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} ({m.email})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Location & Organization */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <Building className="w-4 h-4 text-indigo-600" />
                            Work Location & Schedule
                          </h3>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Work Email *
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Work Location
                            </label>
                            <input
                              type="text"
                              name="workLocation"
                              value={formData.workLocation}
                              onChange={handleChange}
                              placeholder="e.g. Headquarters / Remote"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              name="company"
                              value={formData.company}
                              onChange={handleChange}
                              placeholder="e.g. Acme Corp"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Working Schedule
                            </label>
                            <select
                              name="workingScheduleId"
                              value={formData.workingScheduleId}
                              onChange={handleChange}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                              <option value="">-- Standard Schedule --</option>
                              {(options?.schedules || []).map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name} ({s.averageHoursPerDay}h/day)
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Info */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-600" />
                            Payroll & Bank Details
                          </h3>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Bank Account / IBAN
                            </label>
                            <input
                              type="text"
                              name="bankAccount"
                              value={formData.bankAccount}
                              onChange={handleChange}
                              placeholder="e.g. US1234567890123456"
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Employment Status
                            </label>
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleChange}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive / Suspended</option>
                            </select>
                          </div>
                        </div>

                        {/* Role & Access Security */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-600" />
                            Access & Security
                          </h3>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              System Role
                            </label>
                            <select
                              name="role"
                              value={formData.role}
                              onChange={handleChange}
                              disabled={!canEditRole}
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                            >
                              {Object.entries(ROLES).map(([key, val]) => (
                                <option key={val} value={val}>
                                  {ROLE_LABELS[val] || val}
                                </option>
                              ))}
                            </select>
                            {!canEditRole && (
                              <p className="text-[11px] text-slate-400 mt-1">
                                {isEditingSelf
                                  ? 'You cannot alter your own system role.'
                                  : 'Only Administrators can change user roles.'}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Reset Password (leave empty to keep current)
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

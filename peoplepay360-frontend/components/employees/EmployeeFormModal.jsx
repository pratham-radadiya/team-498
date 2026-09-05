'use client';

import { useState, useEffect } from 'react';
import { ROLES, ROLE_LABELS, canPerformAction } from '@/lib/rbac';
import {
  X,
  User,
  FileText,
  Clock,
  Calendar,
  Layers,
  Save,
  Trash2,
  AlertCircle,
  UserPlus,
  ChevronDown
} from 'lucide-react';

export default function EmployeeFormModal({
  isOpen,
  onClose,
  employeeId,
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  managerOptions = [],
  currentUserRole,
  currentUserId,
  onSuccess,
}) {
  const isCreate = !employeeId;
  const [activeTab, setActiveTab] = useState('work'); // 'work' | 'private'
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
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

  // Smart Button Badge Counts
  const [smartCounts, setSmartCounts] = useState({
    contracts: 0,
    attendance: 0,
    timeOff: 0,
    allocations: 0,
  });

  // Permissions
  const isAdmin = currentUserRole === ROLES.ADMIN;
  const isEditingSelf = employeeId === currentUserId;
  const canEditRole = isAdmin && !isEditingSelf;

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      setError('');
      fetchEmployeeById(employeeId)
        .then((data) => {
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
        })
        .catch((err) => {
          setError(err.message || 'Failed to load employee details');
        })
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
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
      setSmartCounts({ contracts: 0, attendance: 0, timeOff: 0, allocations: 0 });
      setError('');
    }
  }, [isOpen, employeeId, isCreate, fetchEmployeeById]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (isCreate) {
        // Validate required 5 fields
        if (!formData.name.trim()) {
          setError('Full Name is required.');
          setSubmitting(false);
          return;
        }
        if (!formData.email.trim()) {
          setError('Work Email is required.');
          setSubmitting(false);
          return;
        }
        if (!formData.password || formData.password.length < 8) {
          setError('Password is required and must be at least 8 characters long.');
          setSubmitting(false);
          return;
        }
        if (!formData.role) {
          setError('Role selection is required.');
          setSubmitting(false);
          return;
        }

        // Exact 5-field API payload per Phase 1 API Contract
        const createPayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          status: formData.status || 'Active',
        };

        await createEmployee(createPayload);
      } else {
        // Edit Mode
        const updatePayload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          status: formData.status,
          department: formData.department?.trim() || null,
          jobPosition: formData.jobPosition?.trim() || null,
          workLocation: formData.workLocation?.trim() || null,
          company: formData.company?.trim() || null,
          bankAccount: formData.bankAccount?.trim() || null,
          workingScheduleId: formData.workingScheduleId || null,
          managerId: formData.managerId || null,
        };

        if (canEditRole) {
          updatePayload.role = formData.role;
        }

        await updateEmployee(employeeId, updatePayload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Operation failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this employee? This action is permanent.')) {
      try {
        setSubmitting(true);
        await deleteEmployee(employeeId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete employee.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Reusable input styling for crystal-clear visible borders & focus ring
  const inputClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 border-solid rounded-2xl text-slate-900 text-base font-medium placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block';
  
  const selectClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 border-solid rounded-2xl text-slate-900 text-base font-semibold appearance-none cursor-pointer pr-10 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block';

  const labelClassName =
    'block text-sm font-bold text-slate-800 mb-2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Spacious Header Bar */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              {isCreate ? <UserPlus className="w-6 h-6" /> : <User className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Add New Employee' : `Edit Employee — ${formData.name}`}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isCreate
                  ? 'Enter account details below to create an employee profile & user access'
                  : 'Update employee HR details and security access'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Smart Buttons Header (Edit Mode only) */}
        {!isCreate && (
          <div className="px-8 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-3 overflow-x-auto custom-scrollbar">
            <a
              href="/contracts"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 text-xs font-bold text-slate-700 shadow-xs transition-all"
            >
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Contracts</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[11px]">
                {smartCounts.contracts}
              </span>
            </a>

            <a
              href="/attendance"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/50 text-xs font-bold text-slate-700 shadow-xs transition-all"
            >
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Attendance</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[11px]">
                {smartCounts.attendance}
              </span>
            </a>

            <a
              href="/time-off/requests"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-amber-400 hover:bg-amber-50/50 text-xs font-bold text-slate-700 shadow-xs transition-all"
            >
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Time Off</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-600 text-white text-[11px]">
                {smartCounts.timeOff}
              </span>
            </a>

            <a
              href="/time-off/allocations"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 text-xs font-bold text-slate-700 shadow-xs transition-all"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Allocations</span>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px]">
                {smartCounts.allocations}
              </span>
            </a>
          </div>
        )}

        {/* Tab Navigation for Edit Mode only */}
        {!isCreate && (
          <div className="px-8 pt-4 bg-white border-b border-slate-200 flex gap-8">
            <button
              onClick={() => setActiveTab('work')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'work'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Work Information
            </button>
            <button
              onClick={() => setActiveTab('private')}
              className={`pb-3 text-sm font-bold border-b-2 transition-all ${
                activeTab === 'private'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Private & Security Info
            </button>
          </div>
        )}

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading employee details...</div>
          ) : isCreate ? (
            /* CREATE MODE: 5 CLEARLY DEFINED & VISIBLE INPUT FIELDS */
            <div className="space-y-6">
              {/* 1. Full Name */}
              <div>
                <label className={labelClassName}>
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  required
                  className={inputClassName}
                />
              </div>

              {/* 2. Work Email */}
              <div>
                <label className={labelClassName}>
                  Work Email (Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  required
                  className={`${inputClassName} font-mono`}
                />
              </div>

              {/* 3. Password */}
              <div>
                <label className={labelClassName}>
                  Account Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  required
                  className={inputClassName}
                />
                <p className="text-xs text-slate-500 mt-1.5 font-medium">Password must be at least 8 characters long.</p>
              </div>

              {/* 4. Role & 5. Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                <div>
                  <label className={labelClassName}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={selectClassName}
                    >
                      {Object.keys(ROLES).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]} ({r})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className={labelClassName}>
                    Account Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className={selectClassName}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'work' ? (
            /* EDIT MODE — Work Info Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Job Position</label>
                <input
                  type="text"
                  name="jobPosition"
                  value={formData.jobPosition}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Manager</label>
                <div className="relative">
                  <select
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    <option value="">No Manager Selected</option>
                    {managerOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClassName}>Work Location</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div>
                <label className={labelClassName}>Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={inputClassName}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Account Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={selectClassName}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive (Blocks Login)</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE — Private & Security Info Tab */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClassName}>Work Email (Login Username) *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`${inputClassName} font-mono`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Access Role *</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={!canEditRole}
                    className={`${selectClassName} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {Object.keys(ROLES).map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]} ({r})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {!isAdmin && (
                  <p className="text-xs text-amber-600 mt-1.5 font-medium">
                    Only Administrators can provision or modify user roles.
                  </p>
                )}
                {isEditingSelf && (
                  <p className="text-xs text-amber-600 mt-1.5 font-medium">
                    You cannot modify your own access role.
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={labelClassName}>Bank Account Number</label>
                <input
                  type="text"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  placeholder="e.g. 1234567890"
                  className={`${inputClassName} font-mono`}
                />
              </div>
            </div>
          )}
        </form>

        {/* Professional Footer Actions */}
        <div className="px-8 py-6 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && canPerformAction(currentUserRole, 'employees', 'delete') && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Employee</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2.5 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isCreate ? 'Create Employee' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


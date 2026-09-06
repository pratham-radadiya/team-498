'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useContracts } from '@/hooks/useContracts';
import { useEmployees } from '@/hooks/useEmployees';
import { useSchedules } from '@/hooks/useSchedules';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { canPerformAction } from '@/lib/rbac';
import { formatCurrency, sanitizeDateInput } from '@/lib/formatters';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import SearchableSelect from '@/components/ui/SearchableSelect';
import {
  FileText,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function ContractDetailView({ id }) {
  const router = useRouter();
  const { role } = useAuthSession();
  const { fetchContractById, updateContract, deleteContract } = useContracts();
  const { options: employeeOptions, fetchOptions: fetchEmployeeOptions } = useEmployees();
  const { options: scheduleOptions, fetchScheduleOptions } = useSchedules();
  const { fetchStructureOptions } = useSalaryStructures();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [structureOptions, setStructureOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    contractReference: '',
    employeeId: '',
    employeeName: '',
    department: '',
    jobPosition: '',
    startDate: '',
    endDate: '',
    wage: '',
    workingScheduleId: '',
    salaryStructureId: '',
    status: 'Running',
    notes: '',
  });

  const canEdit = canPerformAction(role, 'contracts', 'update');
  const canDelete = canPerformAction(role, 'contracts', 'delete');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      fetchEmployeeOptions();
      fetchScheduleOptions();
      fetchStructureOptions().then((opts) => setStructureOptions(opts || [])).catch(() => {});

      const data = await fetchContractById(id);
      setFormData({
        contractReference: data.contractReference || `CON-${id.slice(0, 6).toUpperCase()}`,
        employeeId: data.employeeId || data.employee?.id || '',
        employeeName: data.employee?.name || data.employeeName || '',
        department: data.department || data.employee?.department || '',
        jobPosition: data.jobPosition || data.employee?.jobPosition || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        wage: data.wage !== undefined ? String(data.wage) : '',
        workingScheduleId: data.workingScheduleId || '',
        salaryStructureId: data.salaryStructureId || data.structureId || '',
        status: data.status || 'Running',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load contract details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchContractById, fetchEmployeeOptions, fetchScheduleOptions, fetchStructureOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formattedEmployeeOptions = useMemo(() => {
    const list = Array.isArray(employeeOptions) ? [...employeeOptions] : [];
    if (formData.employeeId && !list.some((opt) => String(opt.id) === String(formData.employeeId))) {
      list.unshift({
        id: formData.employeeId,
        label: formData.employeeName || 'Assigned Employee',
        sublabel: formData.department ? `${formData.department} • ${formData.jobPosition || ''}` : formData.jobPosition || '',
      });
    }
    return list;
  }, [employeeOptions, formData.employeeId, formData.employeeName, formData.department, formData.jobPosition]);

  const handleChange = (e) => {
    let { name, value, type } = e.target;
    if (type === 'date' && value) {
      value = sanitizeDateInput(value);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'employeeId') {
        const found = formattedEmployeeOptions.find((opt) => String(opt.id) === String(value));
        if (found) {
          next.employeeName = found.label;
        }
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.employeeId) {
      setError('Employee selection is required.');
      return;
    }
    if (!formData.startDate) {
      setError('Start Date is required.');
      return;
    }
    if (!formData.wage || Number(formData.wage) <= 0) {
      setError('Monthly Wage must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        department: formData.department || undefined,
        jobPosition: formData.jobPosition || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        wage: Number(formData.wage),
        workingScheduleId: formData.workingScheduleId || undefined,
        salaryStructureId: formData.salaryStructureId || undefined,
        status: formData.status,
        notes: formData.notes || undefined,
      };

      await updateContract(id, payload);
      setSuccessMsg('Contract updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save contract');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this employment contract?')) return;
    setDeleting(true);
    try {
      await deleteContract(id);
      router.push('/contracts');
    } catch (err) {
      setError(err.message || 'Failed to delete contract');
      setDeleting(false);
    }
  };

  const statusBadgeColor = {
    Running: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Expired: 'bg-rose-50 text-rose-700 border-rose-200',
    Cancelled: 'bg-amber-50 text-amber-700 border-amber-200',
  }[formData.status] || 'bg-slate-100 text-slate-700 border-slate-200';

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
              { label: 'Contracts', href: '/contracts' },
              { label: formData.contractReference || 'Contract Details' }
            ]}
            title={formData.contractReference || 'Employment Contract'}
            subtitle={formData.employeeName ? `Employee: ${formData.employeeName} (${formData.jobPosition || 'General'})` : 'Employment Terms'}
            icon={<FileText className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeColor}`}>
                {formData.status}
              </span>
            }
            backHref="/contracts"
            actions={
              <div className="flex items-center gap-2">
                {canDelete && (
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

                {canEdit && (
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
                )}
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
              <p className="text-sm">Loading contract details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Employee & Role Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Employee & Position
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employee *
                      </label>
                      <SearchableSelect
                        name="employeeId"
                        options={formattedEmployeeOptions}
                        value={formData.employeeId}
                        onChange={handleChange}
                        placeholder="Search employee by name..."
                        disabled={!canEdit}
                        required
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
                        disabled={!canEdit}
                        placeholder="e.g. Technology"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
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
                        disabled={!canEdit}
                        placeholder="e.g. Lead Engineer"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Duration & Status */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Contract Validity & State
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        disabled={!canEdit}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contract Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Running">Running</option>
                        <option value="Expired">Expired</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Salary & Structure Configuration */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                    Compensation & Schedule Assignment
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Basic Wage ($) *
                      </label>
                      <input
                        type="number"
                        name="wage"
                        step="0.01"
                        min="0"
                        value={formData.wage}
                        onChange={handleChange}
                        disabled={!canEdit}
                        required
                        placeholder="5000.00"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Salary Structure
                      </label>
                      <select
                        name="salaryStructureId"
                        value={formData.salaryStructureId}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="">-- Select Salary Structure --</option>
                        {structureOptions.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name} ({st.code || 'Standard'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Working Schedule
                      </label>
                      <select
                        name="workingScheduleId"
                        value={formData.workingScheduleId}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="">-- Select Working Schedule --</option>
                        {(scheduleOptions || []).map((sc) => (
                          <option key={sc.id} value={sc.id}>
                            {sc.name} ({sc.averageHoursPerDay}h/day)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contract Notes & Special Clauses
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={!canEdit}
                    placeholder="Any special employment terms, bonuses, or notice periods..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

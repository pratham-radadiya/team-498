'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../../src/components/common/DataTable.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import Modal from '../../../../src/components/common/Modal.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { mockTimeOffRequests } from '../../../../src/mock/timeOff.js';
import { mockTimeOffTypes } from '../../../../src/mock/timeOff.js';
import { useAuth } from '../../../../src/context/AuthContext.jsx';
import { PERMISSIONS, ROLES } from '../../../../src/lib/permissions.js';
import { Plus, CheckCircle, XCircle } from 'lucide-react';

export default function TimeOffRequestsPage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ employeeId: user?.employeeId || '', timeOffTypeId: '', startDate: '', endDate: '', duration: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const isSelfOnly = role === ROLES.EMPLOYEE;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let res = [...mockTimeOffRequests];
      if (isSelfOnly) res = res.filter((r) => r.employeeId === user?.employeeId);
      if (statusFilter) res = res.filter((r) => r.status === statusFilter);
      setRequests(res);
      setLoading(false);
    }, 400);
  }, [statusFilter, isSelfOnly, user?.employeeId]);

  const handleApprove = (id) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Approved' } : r));
  };
  const handleRefuse = (id) => {
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'Refused' } : r));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    const newReq = { id: `TOR${Date.now()}`, ...newForm, employeeName: user?.name || 'Employee', timeOffTypeName: mockTimeOffTypes.find((t) => t.id === newForm.timeOffTypeId)?.name || '', status: 'Pending', submittedDate: new Date().toISOString().split('T')[0] };
    mockTimeOffRequests.unshift(newReq);
    setRequests((prev) => [newReq, ...prev]);
    setShowNewModal(false);
    setSubmitting(false);
  };

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800">{v}</p>
        <p className="text-xs text-slate-400">{row.employeeId}</p>
      </div>
    )},
    { key: 'timeOffTypeName', label: 'Type' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'duration', label: 'Duration', render: (v) => `${v} day${v !== 1 ? 's' : ''}` },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" showDot /> },
    { key: 'actions', label: 'Actions', render: (_, row) => (
      <PermissionGuard permission={PERMISSIONS.TIMEOFF_APPROVE}>
        {row.status === 'Pending' && (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => handleApprove(row.id)} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition">
              <CheckCircle size={12} /> Approve
            </button>
            <button onClick={() => handleRefuse(row.id)} className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition">
              <XCircle size={12} /> Refuse
            </button>
          </div>
        )}
      </PermissionGuard>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Requests"
        subtitle={`${requests.length} requests`}
        actions={
          <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
            <Plus size={16} /> New Request
          </button>
        }
      />

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['Pending','Approved','Refused','Cancelled'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={requests} loading={loading} emptyMessage="No leave requests found." onRowClick={(row) => router.push(`/time-off/requests/${row.id}`)} total={requests.length} />

      {/* New Request Modal */}
      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="New Leave Request" size="md"
        footer={<>
          <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
          <button form="new-request-form" type="submit" disabled={submitting} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </>}
      >
        <form id="new-request-form" onSubmit={handleSubmitRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type *</label>
            <select value={newForm.timeOffTypeId} onChange={(e) => setNewForm((f) => ({ ...f, timeOffTypeId: e.target.value }))} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select leave type</option>
              {mockTimeOffTypes.filter((t) => t.active).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
              <input type="date" value={newForm.startDate} onChange={(e) => setNewForm((f) => ({ ...f, startDate: e.target.value }))} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
              <input type="date" value={newForm.endDate} onChange={(e) => setNewForm((f) => ({ ...f, endDate: e.target.value }))} required className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (days)</label>
            <input type="number" min="0.5" step="0.5" value={newForm.duration} onChange={(e) => setNewForm((f) => ({ ...f, duration: e.target.value }))} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. 2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason</label>
            <textarea value={newForm.reason} onChange={(e) => setNewForm((f) => ({ ...f, reason: e.target.value }))} rows={3} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Brief reason for leave..." />
          </div>
        </form>
      </Modal>
    </div>
  );
}

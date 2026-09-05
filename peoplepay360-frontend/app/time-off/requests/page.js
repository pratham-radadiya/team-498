'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import RequestList from '@/components/time-off/RequestList';
import RequestFormModal from '@/components/time-off/RequestFormModal';
import { useTimeOffRequests } from '@/hooks/useTimeOffRequests';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import apiClient from '@/lib/api-client';
import { Calendar, Plus, RefreshCw, Award, Layers } from 'lucide-react';
import Link from 'next/link';

export default function TimeOffRequestsPage() {
  const { session } = useAuthSession();
  const currentUserRole = session?.role || 'EMPLOYEE';
  const canApprove = canPerformAction(currentUserRole, 'timeOff', 'approve');

  const {
    fetchRequestById,
    createRequest,
    approveRequest,
    refuseRequest,
    deleteRequest,
  } = useTimeOffRequests();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    // Fetch dropdown choices
    const loadDropdownData = async () => {
      try {
        const [empRes, typeRes] = await Promise.all([
          apiClient.post('/api/employees/list', { startRow: 0, endRow: 200 }),
          apiClient.get('/api/timeoff/types'),
        ]);

        const empRows = empRes.data?.rows || [];
        setEmployeeOptions(
          empRows.map((e) => ({
            id: e.id,
            label: `${e.firstName} ${e.lastName}`,
          }))
        );

        const typeList = typeRes.data || [];
        setTypeOptions(
          typeList.map((t) => ({
            id: t.id,
            name: t.name,
            unit: t.unit,
          }))
        );
      } catch (err) {
        console.error('Failed to load dropdown choices for time off requests page:', err);
      }
    };

    loadDropdownData();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedRequestId(null);
    setIsModalOpen(true);
  };

  const handleSelectRequest = (id) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  const handleApproveRequest = async (id) => {
    try {
      await approveRequest(id);
      setGridRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to approve request.');
    }
  };

  const handleRefuseRequest = async (id) => {
    try {
      await refuseRequest(id);
      setGridRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to refuse request.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Time Off Requests" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Time Off Requests</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Submit and review leave applications across all departments
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/time-off/allocations"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-slate-500" />
                <span>Allocations</span>
              </Link>

              <Link
                href="/time-off/types"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Policy Types</span>
              </Link>

              <button
                onClick={() => setGridRefreshTrigger((prev) => prev + 1)}
                className="p-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl transition-all shadow-xs"
                title="Refresh Table"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleOpenCreateModal}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>New Request</span>
              </button>
            </div>
          </div>

          {/* Request List Table */}
          <RequestList
            refreshTrigger={gridRefreshTrigger}
            onSelectRequest={handleSelectRequest}
            onApproveRequest={handleApproveRequest}
            onRefuseRequest={handleRefuseRequest}
            canApprove={canApprove}
          />
        </div>
      </main>

      {/* Create / Edit Modal */}
      <RequestFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requestId={selectedRequestId}
        fetchRequestById={fetchRequestById}
        createRequest={createRequest}
        approveRequest={approveRequest}
        refuseRequest={refuseRequest}
        deleteRequest={deleteRequest}
        employeeOptions={employeeOptions}
        typeOptions={typeOptions}
        currentUserRole={currentUserRole}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

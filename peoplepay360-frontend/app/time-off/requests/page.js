'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import RequestList from '@/components/time-off/RequestList';
import RequestFormModal from '@/components/time-off/RequestFormModal';
import { useTimeOffRequests } from '@/hooks/useTimeOffRequests';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import apiClient from '@/lib/api-client';
import { Calendar, Plus, RefreshCw, Award, Layers, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function TimeOffRequestsPage() {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const canApprove = canPerformAction(currentUserRole, 'timeOffRequests', 'approve');

  const {
    requests,
    totalCount,
    loading,
    fetchRequests,
    fetchRequestById,
    createRequest,
    approveRequest,
    refuseRequest,
    deleteRequest,
  } = useTimeOffRequests();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    const startRow = (page - 1) * pageSize;
    fetchRequests({ startRow, endRow: page * pageSize });
  }, [page, pageSize, gridRefreshTrigger, fetchRequests]);

  useEffect(() => {
    // Fetch dropdown choices
    const loadDropdownData = async () => {
      try {
        const [empRes, typeRes] = await Promise.allSettled([
          apiClient.get('/api/employees/options'),
          apiClient.get('/api/timeoff/types/options'),
        ]);

        let empList = [];
        if (empRes.status === 'fulfilled' && empRes.value.data) {
          empList = Array.isArray(empRes.value.data) ? empRes.value.data : empRes.value.data.rows || [];
        } else {
          const fallbackEmp = await apiClient.post('/api/employees/list', { startRow: 0, endRow: 200 });
          empList = fallbackEmp.data?.rows || [];
        }

        setEmployeeOptions(
          empList.map((e) => ({
            id: e.id,
            label: e.label || e.name || (e.firstName ? `${e.firstName} ${e.lastName}` : e.id),
          }))
        );

        const typeList =
          typeRes.status === 'fulfilled' && typeRes.value.data
            ? Array.isArray(typeRes.value.data)
              ? typeRes.value.data
              : typeRes.value.data.rows || []
            : [];

        setTypeOptions(
          typeList.map((t) => ({
            id: t.id,
            name: t.label || t.name || t.id,
            unit: t.unit || 'Days',
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
    router.push(`/time-off/requests/${id}`);
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

  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      req.employeeName?.toLowerCase().includes(query) ||
      req.employeeId?.toLowerCase().includes(query) ||
      req.typeName?.toLowerCase().includes(query) ||
      req.status?.toLowerCase().includes(query);

    const matchesStatus = !statusFilter || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
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

          {/* Search & Filter Toolbar */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80 md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-600">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by employee, policy type..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3.5 py-2">
                <Filter className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="To Approve">To Approve</option>
                  <option value="Approved">Approved</option>
                  <option value="Refused">Refused</option>
                </select>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
                Showing <span className="text-indigo-600 font-extrabold">{filteredRequests.length}</span> of {totalCount || filteredRequests.length} records
              </span>
            </div>
          </div>

          {/* Request List Table */}
          <RequestList
            requests={filteredRequests}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
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

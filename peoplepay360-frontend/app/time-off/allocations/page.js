'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AllocationList from '@/components/time-off/AllocationList';
import AllocationFormModal from '@/components/time-off/AllocationFormModal';
import { useAllocations } from '@/hooks/useAllocations';
import { useAuthSession } from '@/hooks/useAuthSession';
import { canPerformAction } from '@/lib/rbac';
import apiClient from '@/lib/api-client';
import { Award, Plus, RefreshCw, Layers, Search } from 'lucide-react';
import Link from 'next/link';

export default function AllocationsPage() {
  const { role: currentUserRole } = useAuthSession();
  const canGrant = canPerformAction(currentUserRole, 'timeOffAllocations', 'create');

  const {
    allocations,
    totalCount,
    loading,
    fetchAllocations,
    fetchAllocationById,
    createAllocation,
    updateAllocation,
    approveAllocation,
    refuseAllocation,
    deleteAllocation,
  } = useAllocations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  // Pagination & Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

  useEffect(() => {
    const startRow = (page - 1) * pageSize;
    fetchAllocations({ startRow, endRow: page * pageSize });
  }, [page, pageSize, gridRefreshTrigger, fetchAllocations]);

  useEffect(() => {
    // Fetch employee and time off policy types for modal pickers
    const loadDropdownData = async () => {
      try {
        const [empRes, typeRes] = await Promise.all([
          apiClient.post('/api/employees/list', { startRow: 0, endRow: 200 }),
          apiClient.get('/api/timeoff/types/options'),
        ]);

        const empRows = empRes.data?.rows || [];
        setEmployeeOptions(
          empRows.map((e) => ({
            id: e.id,
            label: `${e.name || (e.firstName ? `${e.firstName} ${e.lastName}` : e.id)}`,
          }))
        );

        const typeList = typeRes.data || [];
        setTypeOptions(
          typeList.map((t) => ({
            id: t.id,
            name: t.label || t.name || t.id,
            unit: t.unit || 'Days',
          }))
        );
      } catch (err) {
        console.error('Failed to load dropdown choices for allocations page:', err);
      }
    };

    loadDropdownData();
  }, []);

  const handleOpenCreateModal = () => {
    setSelectedAllocationId(null);
    setIsModalOpen(true);
  };

  const handleSelectAllocation = (id) => {
    setSelectedAllocationId(id);
    setIsModalOpen(true);
  };

  const handleModalSuccess = () => {
    setGridRefreshTrigger((prev) => prev + 1);
  };

  const handleApproveAllocation = async (id) => {
    try {
      await approveAllocation(id);
      setGridRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to approve allocation.');
    }
  };

  const handleRefuseAllocation = async (id) => {
    try {
      await refuseAllocation(id);
      setGridRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      alert(err.message || 'Failed to reject allocation.');
    }
  };

  const filteredAllocations = allocations.filter((alloc) => {
    const query = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      alloc.employeeName?.toLowerCase().includes(query) ||
      alloc.employeeId?.toLowerCase().includes(query) ||
      alloc.typeName?.toLowerCase().includes(query) ||
      alloc.status?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Time Off Allocations" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Bar / Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Award className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Leave Allocations</h1>
              </div>
              <p className="text-slate-500 text-sm mt-1">
                Grant and view employee leave entitlements, balances, and allocations
              </p>
            </div>

            <div className="flex items-center gap-3">
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

              {canGrant && (
                <button
                  onClick={handleOpenCreateModal}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Grant Allocation</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Toolbar */}
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

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
              Showing <span className="text-indigo-600 font-extrabold">{filteredAllocations.length}</span> of {totalCount || filteredAllocations.length} records
            </span>
          </div>

          {/* Allocation List Table View */}
          <AllocationList
            allocations={filteredAllocations}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onAllocationClick={handleSelectAllocation}
            onApproveAllocation={handleApproveAllocation}
            onRefuseAllocation={handleRefuseAllocation}
            canApprove={canGrant}
          />
        </div>
      </main>

      {/* Create / Edit Allocation Modal */}
      <AllocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allocationId={selectedAllocationId}
        fetchAllocationById={fetchAllocationById}
        createAllocation={createAllocation}
        updateAllocation={updateAllocation}
        deleteAllocation={deleteAllocation}
        employeeOptions={employeeOptions}
        typeOptions={typeOptions}
        currentUserRole={currentUserRole}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}

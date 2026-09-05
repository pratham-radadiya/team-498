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
import { Award, Plus, RefreshCw, Layers } from 'lucide-react';
import Link from 'next/link';

export default function AllocationsPage() {
  const { role: currentUserRole } = useAuthSession();
  const canGrant = canPerformAction(currentUserRole, 'timeOffAllocations', 'create');

  const {
    fetchAllocationById,
    createAllocation,
    updateAllocation,
    approveAllocation,
    deleteAllocation,
  } = useAllocations();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAllocationId, setSelectedAllocationId] = useState(null);
  const [gridRefreshTrigger, setGridRefreshTrigger] = useState(0);

  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [typeOptions, setTypeOptions] = useState([]);

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
                <RefreshCw className="w-5 h-5" />
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

          {/* Allocation List Table View */}
          <AllocationList
            refreshTrigger={gridRefreshTrigger}
            onSelectAllocation={handleSelectAllocation}
            approveAllocation={approveAllocation}
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

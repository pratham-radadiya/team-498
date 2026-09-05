'use client';

import { useState, useEffect } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useTimeOffTypes } from '@/hooks/useTimeOffTypes';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import TimeOffTypeList from '@/components/time-off/TimeOffTypeList';
import TimeOffTypeFormModal from '@/components/time-off/TimeOffTypeFormModal';
import { Tag, Plus, Search, RefreshCw } from 'lucide-react';

export default function TimeOffTypesPage() {
  const { role } = useAuthSession();
  const {
    types,
    totalCount,
    loading,
    fetchTypes,
    fetchTypeById,
    createType,
    updateType,
    deleteType,
  } = useTimeOffTypes();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState(null);

  useEffect(() => {
    const startRow = (page - 1) * pageSize;
    fetchTypes({ startRow, endRow: page * pageSize });
  }, [page, pageSize, fetchTypes]);

  const handleRefetch = () => {
    fetchTypes({ startRow: (page - 1) * pageSize, endRow: page * pageSize });
  };

  const filteredTypes = types.filter(
    (t) =>
      !searchQuery ||
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.unit?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex relative overflow-x-hidden">
      <Sidebar mobileOpen={mobileSidebarOpen} onMobileClose={() => setMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-24 px-4 sm:px-6 pb-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
                <Tag className="w-6 h-6 text-indigo-600" />
                <span>Time Off Policy Types</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Configure leave types, unit measurement (Days/Hours), and balance allocation rules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefetch}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-xs"
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {canPerformAction(role, 'timeOff', 'create') && (
                <button
                  onClick={() => {
                    setSelectedTypeId(null);
                    setModalOpen(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Time Off Type</span>
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
                placeholder="Search policy types..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
              Showing <span className="text-indigo-600 font-extrabold">{filteredTypes.length}</span> of {totalCount || filteredTypes.length} types
            </span>
          </div>

          {/* Types List */}
          <TimeOffTypeList
            types={filteredTypes}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onTypeClick={(id) => {
              setSelectedTypeId(id);
              setModalOpen(true);
            }}
          />
        </main>
      </div>

      {/* Form Modal */}
      <TimeOffTypeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        typeId={selectedTypeId}
        fetchTypeById={fetchTypeById}
        createType={createType}
        updateType={updateType}
        deleteType={deleteType}
        currentUserRole={role}
        onSuccess={handleRefetch}
      />
    </div>
  );
}

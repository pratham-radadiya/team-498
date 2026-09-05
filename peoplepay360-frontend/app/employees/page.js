'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useEmployees } from '@/hooks/useEmployees';
import { ROLES, ROLE_LABELS, canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import EmployeeKanban from '@/components/employees/EmployeeKanban';
import EmployeeList from '@/components/employees/EmployeeList';
import EmployeeFormModal from '@/components/employees/EmployeeFormModal';
import { SkeletonKanban, SkeletonTable } from '@/components/ui/Skeleton';
import {
  Users,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Search,
  Filter,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export default function EmployeesPage() {
  const { role, employeeId: currentUserId } = useAuthSession();
  const {
    employees,
    totalCount,
    loading,
    options,
    fetchEmployees,
    fetchOptions,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  } = useEmployees();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const hasLoadedOptions = useRef(false);

  useEffect(() => {
    if (viewMode === 'kanban') {
      fetchEmployees({ startRow: 0, endRow: 500 });
    } else {
      const startRow = (page - 1) * pageSize;
      const endRow = page * pageSize;
      fetchEmployees({ startRow, endRow });
    }
  }, [viewMode, page, pageSize, fetchEmployees]);

  useEffect(() => {
    if (!hasLoadedOptions.current) {
      hasLoadedOptions.current = true;
      fetchOptions();
    }
  }, [fetchOptions]);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery ||
      emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !roleFilter || emp.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleOpenCreate = () => {
    setSelectedEmployeeId(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (id) => {
    setSelectedEmployeeId(id);
    setModalOpen(true);
  };

  const handleSuccessRefetch = () => {
    if (viewMode === 'kanban') {
      fetchEmployees({ startRow: 0, endRow: 500 });
    } else {
      setPage(1);
      fetchEmployees({ startRow: 0, endRow: pageSize });
    }
    fetchOptions();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex relative overflow-x-hidden font-sans antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-20 px-4 sm:px-6 pb-4 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Space-Efficient Compact Action & Filter Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Employees Directory</h1>
                  <p className="text-xs text-slate-500">Personnel records, roles, and department assignments</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleSuccessRefetch}
                  className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                  title="Refresh list"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>

                {/* View Mode Switcher */}
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-1 flex items-center gap-1">
                  <button
                    onClick={() => {
                      setViewMode('kanban');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'kanban'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kanban</span>
                  </button>
                  <button
                    onClick={() => {
                      setViewMode('list');
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ListIcon className="w-3.5 h-3.5" />
                    <span>List</span>
                  </button>
                </div>

                {/* "+ New Employee" Button */}
                {canPerformAction(role, 'employees', 'create') && (
                  <button
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Employee</span>
                  </button>
                )}
              </div>
            </div>

            {/* High-Density Inline Search & Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="relative w-full md:w-80 lg:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-600">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, department..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                {role === ROLES.ADMIN && (
                  <div className="relative flex items-center">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-600">
                      <Filter className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="appearance-none pl-8 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 hover:border-slate-300 focus:bg-white focus:border-indigo-600 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Roles</option>
                      {Object.keys(ROLES).map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]} ({r})
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
                  Showing <span className="text-indigo-600 font-extrabold">{filteredEmployees.length}</span> of {totalCount || filteredEmployees.length}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content Views */}
          {loading && employees.length === 0 ? (
            viewMode === 'kanban' ? <SkeletonKanban /> : <SkeletonTable />
          ) : viewMode === 'kanban' ? (
            <EmployeeKanban
              employees={filteredEmployees}
              loading={loading}
              onEmployeeClick={handleOpenEdit}
            />
          ) : (
            <EmployeeList
              employees={filteredEmployees}
              loading={loading}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={(newPage) => setPage(newPage)}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize);
                setPage(1);
              }}
              onEmployeeClick={handleOpenEdit}
            />
          )}
        </main>
      </div>

      <EmployeeFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeId={selectedEmployeeId}
        fetchEmployeeById={fetchEmployeeById}
        createEmployee={createEmployee}
        updateEmployee={updateEmployee}
        deleteEmployee={deleteEmployee}
        managerOptions={options}
        currentUserRole={role}
        currentUserId={currentUserId}
        onSuccess={handleSuccessRefetch}
      />
    </div>
  );
}

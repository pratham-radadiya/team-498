'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAttendance } from '@/hooks/useAttendance';
import { useAttendanceWidget } from '@/hooks/useAttendanceWidget';
import { useEmployees } from '@/hooks/useEmployees';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AttendanceList from '@/components/attendance/AttendanceList';
import AttendanceFormModal from '@/components/attendance/AttendanceFormModal';
import { Clock, LogIn, LogOut, Search, RefreshCw, Loader2, User } from 'lucide-react';

export default function AttendancePage() {
  const router = useRouter();
  const { role } = useAuthSession();
  const {
    records,
    totalCount,
    loading,
    fetchAttendanceList,
    fetchAttendanceById,
    correctAttendance,
    deleteAttendance,
  } = useAttendance();

  const { isCheckedIn, elapsedFormatted, loading: widgetLoading, toggleAttendance, refetchCurrent } =
    useAttendanceWidget();

  const { options: employeeOptions, fetchOptions: fetchEmployeeOptions } = useEmployees();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const hasLoadedOptions = useRef(false);

  useEffect(() => {
    const startRow = (page - 1) * pageSize;
    fetchAttendanceList({ startRow, endRow: page * pageSize });
  }, [page, pageSize, fetchAttendanceList]);

  useEffect(() => {
    if (!hasLoadedOptions.current) {
      hasLoadedOptions.current = true;
      fetchEmployeeOptions();
    }
  }, [fetchEmployeeOptions]);

  const handleRefetch = () => {
    fetchAttendanceList({ startRow: (page - 1) * pageSize, endRow: page * pageSize });
    refetchCurrent();
  };

  useEffect(() => {
    const onAttendanceChanged = () => {
      fetchAttendanceList({ startRow: (page - 1) * pageSize, endRow: page * pageSize });
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('attendance-changed', onAttendanceChanged);
      return () => {
        window.removeEventListener('attendance-changed', onAttendanceChanged);
      };
    }
  }, [page, pageSize, fetchAttendanceList]);

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      !searchQuery ||
      rec.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.status?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmp = !employeeFilter || rec.employeeId === employeeFilter;

    return matchesSearch && matchesEmp;
  });

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
                <Clock className="w-6 h-6 text-indigo-600" />
                <span>Attendance & Work Sessions</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Track daily check-in/out timestamps, worked hours, and overtime calculations.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefetch}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-xs"
                title="Refresh records"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Quick Check-In / Check-Out Primary Card */}
              {isCheckedIn ? (
                <button
                  onClick={toggleAttendance}
                  disabled={widgetLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {widgetLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Check Out ({elapsedFormatted})</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={toggleAttendance}
                  disabled={widgetLoading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {widgetLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Check In Now</span>
                    </>
                  )}
                </button>
              )}
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
                placeholder="Search by employee name or status..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              {employeeOptions.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-300 rounded-2xl px-3.5 py-2">
                  <User className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700">Filter Employee:</span>
                  <select
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    <option value="">All Employees</option>
                    {employeeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl">
                Showing <span className="text-indigo-600 font-extrabold">{filteredRecords.length}</span> of {totalCount || filteredRecords.length} records
              </span>
            </div>
          </div>

          {/* Attendance List */}
          <AttendanceList
            records={filteredRecords}
            loading={loading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
            onRecordClick={(id) => router.push(`/attendance/${id}`)}
          />
        </main>
      </div>

      {/* Detail / Correction Modal */}
      <AttendanceFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        recordId={selectedRecordId}
        fetchAttendanceById={fetchAttendanceById}
        correctAttendance={correctAttendance}
        deleteAttendance={deleteAttendance}
        currentUserRole={role}
        onSuccess={handleRefetch}
      />
    </div>
  );
}

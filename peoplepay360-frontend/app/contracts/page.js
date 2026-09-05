'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useContracts } from '@/hooks/useContracts';
import { useSchedules } from '@/hooks/useSchedules';
import { useEmployees } from '@/hooks/useEmployees';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ContractList from '@/components/contracts/ContractList';
import ContractFormModal from '@/components/contracts/ContractFormModal';
import WorkingScheduleList from '@/components/schedules/WorkingScheduleList';
import WorkingScheduleFormModal from '@/components/schedules/WorkingScheduleFormModal';
import { FileText, Clock, Plus, Search, RefreshCw, Calendar } from 'lucide-react';

export default function ContractsPage() {
  const { role } = useAuthSession();
  const {
    contracts,
    totalCount: contractTotal,
    loading: contractLoading,
    fetchContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
  } = useContracts();

  const {
    schedules,
    totalCount: scheduleTotal,
    loading: scheduleLoading,
    options: scheduleOptions,
    fetchSchedules,
    fetchScheduleOptions,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  } = useSchedules();

  const { options: employeeOptions, fetchOptions: fetchEmployeeOptions } = useEmployees();

  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'schedules'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Pagination states
  const [contractPage, setContractPage] = useState(1);
  const [contractPageSize, setContractPageSize] = useState(10);
  const [schedulePage, setSchedulePage] = useState(1);
  const [schedulePageSize, setSchedulePageSize] = useState(10);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);

  const hasLoadedOptions = useRef(false);

  useEffect(() => {
    if (activeTab === 'contracts') {
      const startRow = (contractPage - 1) * contractPageSize;
      fetchContracts({ startRow, endRow: contractPage * contractPageSize });
    } else {
      const startRow = (schedulePage - 1) * schedulePageSize;
      fetchSchedules({ startRow, endRow: schedulePage * schedulePageSize });
    }
  }, [activeTab, contractPage, contractPageSize, schedulePage, schedulePageSize, fetchContracts, fetchSchedules]);

  useEffect(() => {
    if (!hasLoadedOptions.current) {
      hasLoadedOptions.current = true;
      fetchEmployeeOptions();
      fetchScheduleOptions();
    }
  }, [fetchEmployeeOptions, fetchScheduleOptions]);

  const handleRefetch = () => {
    if (activeTab === 'contracts') {
      fetchContracts({ startRow: (contractPage - 1) * contractPageSize, endRow: contractPage * contractPageSize });
    } else {
      fetchSchedules({ startRow: (schedulePage - 1) * schedulePageSize, endRow: schedulePage * schedulePageSize });
    }
    fetchEmployeeOptions();
    fetchScheduleOptions();
  };

  // Filtered lists
  const filteredContracts = contracts.filter(
    (c) =>
      !searchQuery ||
      c.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobPosition?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSchedules = schedules.filter(
    (s) =>
      !searchQuery ||
      s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.calendarType?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <FileText className="w-6 h-6 text-indigo-600" />
                <span>Contracts & Working Schedules</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage employee employment contracts, wage agreements, and 7-day working schedule patterns.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefetch}
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-all shadow-xs"
                title="Refresh list"
              >
                <RefreshCw className={`w-4 h-4 ${contractLoading || scheduleLoading ? 'animate-spin' : ''}`} />
              </button>

              {/* Tab View Switcher */}
              <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-xs">
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'contracts'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Contracts</span>
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    activeTab === 'schedules'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Working Schedules</span>
                </button>
              </div>

              {/* Create Action Button */}
              {canPerformAction(role, 'contracts', 'create') && (
                <button
                  onClick={() => {
                    if (activeTab === 'contracts') {
                      setSelectedContractId(null);
                      setContractModalOpen(true);
                    } else {
                      setSelectedScheduleId(null);
                      setScheduleModalOpen(true);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{activeTab === 'contracts' ? 'New Contract' : 'New Schedule'}</span>
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
                placeholder={
                  activeTab === 'contracts'
                    ? 'Search by employee, department, position...'
                    : 'Search by schedule name, type, company...'
                }
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 transition-all outline-none"
              />
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3.5 py-2.5 rounded-2xl self-end sm:self-auto">
              Showing{' '}
              <span className="text-indigo-600 font-extrabold">
                {activeTab === 'contracts' ? filteredContracts.length : filteredSchedules.length}
              </span>{' '}
              records
            </span>
          </div>

          {/* Tab Views */}
          {activeTab === 'contracts' ? (
            <ContractList
              contracts={filteredContracts}
              loading={contractLoading}
              totalCount={contractTotal}
              page={contractPage}
              pageSize={contractPageSize}
              onPageChange={(p) => setContractPage(p)}
              onPageSizeChange={(s) => {
                setContractPageSize(s);
                setContractPage(1);
              }}
              onContractClick={(id) => {
                setSelectedContractId(id);
                setContractModalOpen(true);
              }}
            />
          ) : (
            <WorkingScheduleList
              schedules={filteredSchedules}
              loading={scheduleLoading}
              totalCount={scheduleTotal}
              page={schedulePage}
              pageSize={schedulePageSize}
              onPageChange={(p) => setSchedulePage(p)}
              onPageSizeChange={(s) => {
                setSchedulePageSize(s);
                setSchedulePage(1);
              }}
              onScheduleClick={(id) => {
                setSelectedScheduleId(id);
                setScheduleModalOpen(true);
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ContractFormModal
        isOpen={contractModalOpen}
        onClose={() => setContractModalOpen(false)}
        contractId={selectedContractId}
        fetchContractById={fetchContractById}
        createContract={createContract}
        updateContract={updateContract}
        deleteContract={deleteContract}
        employeeOptions={employeeOptions}
        scheduleOptions={scheduleOptions}
        onSuccess={handleRefetch}
      />

      <WorkingScheduleFormModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        scheduleId={selectedScheduleId}
        fetchScheduleById={fetchScheduleById}
        createSchedule={createSchedule}
        updateSchedule={updateSchedule}
        deleteSchedule={deleteSchedule}
        onSuccess={handleRefetch}
      />
    </div>
  );
}

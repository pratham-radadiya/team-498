'use client';

import { useMemo } from 'react';
import { getInitials, getStatusBadgeClass } from '@/lib/formatters';
import { ROLE_LABELS } from '@/lib/rbac';
import { SkeletonKanban } from '@/components/ui/Skeleton';
import { Mail, Briefcase, MapPin, Building, ShieldCheck, UserCheck } from 'lucide-react';

export default function EmployeeKanban({ employees = [], loading = false, onEmployeeClick }) {
  // Group employees by Department
  const departmentGroups = useMemo(() => {
    const groups = {};
    employees.forEach((emp) => {
      const dept = emp.department || 'Unassigned';
      if (!groups[dept]) {
        groups[dept] = [];
      }
      groups[dept].push(emp);
    });
    return groups;
  }, [employees]);

  const departments = Object.keys(departmentGroups);

  if (loading && employees.length === 0) {
    return <SkeletonKanban />;
  }

  if (employees.length === 0) {
    return (
      <div className="card-flat p-12 text-center text-slate-500 bg-white border border-slate-200">
        <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <p className="text-base font-semibold text-slate-700">No employee records found</p>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or create a new employee.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 pt-1 custom-scrollbar items-start w-full min-h-[calc(100vh-240px)] animate-fade-in">
      {departments.map((dept) => (
        <div
          key={dept}
          className="w-80 sm:w-84 shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-3xl p-4 flex flex-col max-h-[calc(100vh-250px)] shadow-xs"
        >
          {/* Department Column Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 shrink-0">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{dept}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
              {departmentGroups[dept].length}
            </span>
          </div>

          {/* Employee Cards Container — Vertically Scrollable Inside Column */}
          <div className="overflow-y-auto space-y-3 custom-scrollbar flex-1 pr-1">
            {departmentGroups[dept].map((emp) => {
              const isActive = (emp.status || 'Active').toLowerCase() === 'active';
              return (
                <div
                  key={emp.id}
                  onClick={() => onEmployeeClick && onEmployeeClick(emp.id)}
                  className="card-hover p-4 cursor-pointer relative group transition-all bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Status Indicator Dot */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-600/20">
                          {getInitials(emp.name)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          title={`Status: ${emp.status || 'Active'}`}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {emp.name}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{emp.jobPosition || 'No Position'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {emp.status || 'Inactive'}
                      </span>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>

                    {emp.workLocation && (
                      <div className="flex items-center gap-2 truncate text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{emp.workLocation}</span>
                      </div>
                    )}

                    {emp.role && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold pt-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span>{ROLE_LABELS[emp.role] || emp.role}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

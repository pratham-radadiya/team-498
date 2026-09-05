'use client';

import { useMemo } from 'react';
import { getInitials } from '@/lib/formatters';
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
      <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
        <UserCheck className="w-12 h-12 mx-auto mb-3 text-slate-400" />
        <p className="text-base font-semibold text-slate-700">No employee records found</p>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar items-start w-full h-[calc(100vh-210px)] min-h-[480px]">
      {departments.map((dept) => (
        <div
          key={dept}
          className="w-76 sm:w-80 shrink-0 bg-slate-200/60 border border-slate-200 rounded-2xl p-3 flex flex-col h-full shadow-2xs"
        >
          {/* Department Column Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-300/80 shrink-0">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{dept}</h3>
            </div>
            <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-300 shadow-2xs">
              {departmentGroups[dept].length}
            </span>
          </div>

          {/* Employee Cards Container */}
          <div className="overflow-y-auto space-y-2.5 custom-scrollbar flex-1 pr-0.5">
            {departmentGroups[dept].map((emp) => {
              const isActive = (emp.status || 'Active').toLowerCase() === 'active';
              return (
                <div
                  key={emp.id}
                  onClick={() => onEmployeeClick && onEmployeeClick(emp.id)}
                  className="p-3 cursor-pointer relative group transition-all bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-indigo-400 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2.5 mb-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                          {getInitials(emp.name)}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                            isActive ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                          title={`Status: ${emp.status || 'Active'}`}
                        />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                          {emp.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{emp.jobPosition || 'No Position'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge */}
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        {emp.status || 'Inactive'}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate font-mono">{emp.email}</span>
                    </div>

                    {emp.role && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold pt-0.5">
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

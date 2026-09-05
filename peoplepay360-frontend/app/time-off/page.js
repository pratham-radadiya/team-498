'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAuthSession } from '@/hooks/useAuthSession';
import apiClient from '@/lib/api-client';
import { formatDate } from '@/lib/formatters';
import { Calendar, Award, Layers, Clock, ArrowRight, User, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';

export default function TimeOffDashboardPage() {
  const { session } = useAuthSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    totalAllocations: 0,
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [reqRes, allocRes, typesRes] = await Promise.all([
          apiClient.post('/api/timeoff/requests/list', { startRow: 0, endRow: 10 }),
          apiClient.post('/api/timeoff/allocations/list', { startRow: 0, endRow: 50 }),
          apiClient.get('/api/timeoff/types/options'),
        ]);

        const reqRows = reqRes.data?.rows || [];
        const reqCount = reqRes.data?.rowCount || reqRows.length;
        const allocRows = allocRes.data?.rows || [];
        const typeList = typesRes.data || [];

        const pending = reqRows.filter(
          (r) => r.status === 'To Approve' || r.status === 'Pending'
        ).length;
        const approved = reqRows.filter((r) => r.status === 'Approved').length;

        setStats({
          totalRequests: reqCount,
          pendingRequests: pending,
          approvedRequests: approved,
          totalAllocations: allocRows.length,
        });

        setRecentRequests(reqRows.slice(0, 5));
        setTypes(typeList);
      } catch (err) {
        console.error('Failed to load Time Off Dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased">
      <Sidebar />
      <Header title="Time Off Overview" />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-64 pt-24 px-4 sm:px-6 pb-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Time Off Management</h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    Welcome back, <span className="font-semibold text-slate-800">{session?.employeeName || 'Team Member'}</span>! Track leave balances, allocations, and requests.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/time-off/requests"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Submit Leave Request</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Requests</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.pendingRequests}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Approved Requests</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.approvedRequests}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Allocations</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : stats.totalAllocations}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Policy Types</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : types.length}</p>
              </div>
            </div>
          </div>

          {/* Quick Nav Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/time-off/requests"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Time Off Requests
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  View, filter, or submit employee leave requests and check approval statuses.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Manage Requests</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/time-off/allocations"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Leave Allocations
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Inspect allocated entitlement balances per employee and policy type.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>View Allocations</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/time-off/types"
              className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Policy Types
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Configure custom leave types (PTO, Sick, Unpaid) and approval workflows.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-extrabold text-indigo-600 gap-1.5 group-hover:translate-x-1 transition-transform">
                <span>Configure Policies</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          </div>

          {/* Recent Requests Preview Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Recent Time Off Requests</h2>
              <Link
                href="/time-off/requests"
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-500 text-sm font-medium">Loading recent requests...</div>
            ) : recentRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm font-medium flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-300" />
                <span>No time off requests found.</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Policy Type</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span>{req.employeeName || req.employeeId}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">{req.typeName || req.typeId}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {formatDate(req.startDate)} → {formatDate(req.endDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold font-mono">
                            {req.numberOfDays || 1}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                              req.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : req.status === 'Refused'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {req.status || 'To Approve'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

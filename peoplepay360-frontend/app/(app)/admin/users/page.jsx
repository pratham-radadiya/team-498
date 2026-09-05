'use client';

import { useState, useEffect } from 'react';
import { userApi } from '../../../../src/api/userApi.js';
import { ROLES, ROLE_LABELS } from '../../../../src/lib/permissions.js';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import Modal from '../../../../src/components/common/Modal.jsx';
import SearchBar from '../../../../src/components/common/SearchBar.jsx';
import {
  Users, UserPlus, Shield, Check, X,
  Lock, Mail, MoreVertical, Edit3, Trash2
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: ROLES.EMPLOYEE,
    employeeName: '',
  });

  const loadUsers = async () => {
    setLoading(true);
    const res = await userApi.getUsers();
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (selectedUser) {
      await userApi.updateUser(selectedUser.id, formData);
    } else {
      await userApi.createUser(formData);
    }
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({ username: '', email: '', role: ROLES.EMPLOYEE, employeeName: '' });
    loadUsers();
  };

  const handleToggleStatus = async (id) => {
    await userApi.toggleUserStatus(id);
    loadUsers();
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      employeeName: user.employeeName || '',
    });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.employeeName && u.employeeName.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
            <p className="text-sm text-slate-500 mt-1">
              Configure system user accounts, credentials, role assignments, and login permissions.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedUser(null);
              setFormData({ username: '', email: '', role: ROLES.EMPLOYEE, employeeName: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
          >
            <UserPlus size={16} />
            <span>Add New User</span>
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} placeholder="Search by username, email, or employee..." />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Roles</option>
            {Object.entries(ROLE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Linked Employee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-semibold text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{u.username}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                        <Shield size={12} />
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.employeeName ? (
                        <span className="text-slate-800 font-medium">{u.employeeName}</span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">System Only</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Edit User"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition ${u.status === 'Active' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                      >
                        {u.status === 'Active' ? <X size={15} /> : <Check size={15} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedUser ? 'Edit User Account' : 'Create New User Account'}
        >
          <form onSubmit={handleCreateOrUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. jdoe"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. jdoe@peoplepay360.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(ROLE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Employee Name (Optional)</label>
              <input
                type="text"
                value={formData.employeeName}
                onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g. John Doe"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition"
              >
                {selectedUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </RoleGuard>
  );
}

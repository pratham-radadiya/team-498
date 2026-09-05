import { mockUsers } from '../mock/users.js';

let usersData = [...mockUsers];

export const userApi = {
  getUsers: async (filters = {}) => {
    let result = [...usersData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.employeeName && u.employeeName.toLowerCase().includes(q))
      );
    }
    if (filters.role) {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters.status) {
      result = result.filter((u) => u.status === filters.status);
    }
    return Promise.resolve({ data: result });
  },

  getUserById: async (id) => {
    const user = usersData.find((u) => u.id === id);
    return Promise.resolve({ data: user });
  },

  createUser: async (userData) => {
    const newUser = {
      id: `USR${String(usersData.length + 1).padStart(3, '0')}`,
      status: 'Active',
      lastLogin: null,
      ...userData,
    };
    usersData.push(newUser);
    return Promise.resolve({ data: newUser });
  },

  updateUser: async (id, updates) => {
    const index = usersData.findIndex((u) => u.id === id);
    if (index !== -1) {
      usersData[index] = { ...usersData[index], ...updates };
      return Promise.resolve({ data: usersData[index] });
    }
    return Promise.reject(new Error('User not found'));
  },

  deleteUser: async (id) => {
    usersData = usersData.filter((u) => u.id !== id);
    return Promise.resolve({ success: true });
  },

  toggleUserStatus: async (id) => {
    const user = usersData.find((u) => u.id === id);
    if (user) {
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
      return Promise.resolve({ data: user });
    }
    return Promise.reject(new Error('User not found'));
  },
};

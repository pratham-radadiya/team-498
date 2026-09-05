/**
 * Mock Data — Users (for Admin module)
 */
import { ROLES } from '../lib/permissions.js';

export const mockUsers = [
  {
    id: 'USR001',
    username: 'admin',
    email: 'admin@peoplepay360.com',
    role: ROLES.ADMIN,
    employeeId: null,
    employeeName: null,
    status: 'Active',
    lastLogin: '2026-09-05T06:00:00',
  },
  {
    id: 'USR002',
    username: 'kavya.reddy',
    email: 'kavya.reddy@peoplepay360.com',
    role: ROLES.HR_MANAGER,
    employeeId: 'EMP004',
    employeeName: 'Kavya Reddy',
    status: 'Active',
    lastLogin: '2026-09-05T09:15:00',
  },
  {
    id: 'USR003',
    username: 'vikram.singh',
    email: 'vikram.singh@peoplepay360.com',
    role: ROLES.HR_PAYROLL_MANAGER,
    employeeId: 'EMP006',
    employeeName: 'Vikram Singh',
    status: 'Active',
    lastLogin: '2026-09-04T17:30:00',
  },
  {
    id: 'USR004',
    username: 'neha.joshi',
    email: 'neha.joshi@peoplepay360.com',
    role: ROLES.HR_PAYROLL_USER,
    employeeId: 'EMP011',
    employeeName: 'Neha Joshi',
    status: 'Active',
    lastLogin: '2026-09-05T10:00:00',
  },
  {
    id: 'USR005',
    username: 'arjun.mehta',
    email: 'arjun.mehta@peoplepay360.com',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP001',
    employeeName: 'Arjun Mehta',
    status: 'Active',
    lastLogin: '2026-09-05T09:00:00',
  },
  {
    id: 'USR006',
    username: 'sneha.iyer',
    email: 'sneha.iyer@peoplepay360.com',
    role: ROLES.EMPLOYEE,
    employeeId: 'EMP002',
    employeeName: 'Sneha Iyer',
    status: 'Active',
    lastLogin: '2026-09-04T18:00:00',
  },
];

// Demo accounts for login page
export const DEMO_ACCOUNTS = [
  {
    email: 'admin@peoplepay360.com',
    password: 'demo123',
    role: ROLES.ADMIN,
    name: 'System Admin',
    userId: 'USR001',
  },
  {
    email: 'kavya.reddy@peoplepay360.com',
    password: 'demo123',
    role: ROLES.HR_MANAGER,
    name: 'Kavya Reddy',
    employeeId: 'EMP004',
    userId: 'USR002',
  },
  {
    email: 'vikram.singh@peoplepay360.com',
    password: 'demo123',
    role: ROLES.HR_PAYROLL_MANAGER,
    name: 'Vikram Singh',
    employeeId: 'EMP006',
    userId: 'USR003',
  },
  {
    email: 'neha.joshi@peoplepay360.com',
    password: 'demo123',
    role: ROLES.HR_PAYROLL_USER,
    name: 'Neha Joshi',
    employeeId: 'EMP011',
    userId: 'USR004',
  },
  {
    email: 'arjun.mehta@peoplepay360.com',
    password: 'demo123',
    role: ROLES.EMPLOYEE,
    name: 'Arjun Mehta',
    employeeId: 'EMP001',
    userId: 'USR005',
  },
];

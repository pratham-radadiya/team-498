/**
 * Auth API — Mock authentication service
 * Replace mock logic with real API calls when backend is ready.
 */
import { DEMO_ACCOUNTS } from '../mock/users.js';

const MOCK_DELAY = 600; // Simulate network latency

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginApi({ email, password }) {
  await delay(MOCK_DELAY);

  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );

  if (!account) {
    throw new Error('Invalid email or password. Try one of the demo accounts.');
  }

  const user = {
    id: account.userId,
    name: account.name,
    email: account.email,
    role: account.role,
    employeeId: account.employeeId || null,
    token: `mock_token_${account.userId}_${Date.now()}`,
  };

  return user;
}

export async function logoutApi() {
  await delay(200);
  return { success: true };
}

export async function getMeApi(token) {
  await delay(300);
  // In production, this would validate the token with the backend
  const stored = typeof window !== 'undefined' ? localStorage.getItem('pp360_user') : null;
  if (stored) return JSON.parse(stored);
  throw new Error('Not authenticated');
}

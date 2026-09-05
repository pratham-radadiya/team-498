'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../src/context/AuthContext.jsx';
import { DEMO_ACCOUNTS } from '../../src/mock/users.js';
import { ROLE_LABELS, ROLE_COLORS } from '../../src/lib/permissions.js';
import { Eye, EyeOff, LogIn, ChevronDown, Users, DollarSign, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setShowDemoAccounts(false);
    setError('');
  };

  const roleColorMap = { EMPLOYEE: 'bg-blue-100 text-blue-700', HR_MANAGER: 'bg-green-100 text-green-700', HR_PAYROLL_USER: 'bg-purple-100 text-purple-700', HR_PAYROLL_MANAGER: 'bg-orange-100 text-orange-700', ADMIN: 'bg-red-100 text-red-700' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">PeoplePay360</h1>
              <p className="text-indigo-300 text-xs font-medium uppercase tracking-widest">HR & Payroll</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm">Sign in to your workspace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm flex items-center gap-2">
                <Shield size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="email">Work Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm text-slate-300">Remember me</span>
              </label>
              <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 transition">Forgot password?</button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              id="login-submit-btn"
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
              className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-slate-200 transition"
            >
              <span className="font-medium">Demo Accounts (Hackathon)</span>
              <ChevronDown size={16} className={`transition-transform ${showDemoAccounts ? 'rotate-180' : ''}`} />
            </button>

            {showDemoAccounts && (
              <div className="mt-3 space-y-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.userId}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition group text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition">{acc.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{acc.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColorMap[acc.role] || 'bg-slate-100 text-slate-700'}`}>
                      {ROLE_LABELS[acc.role]}
                    </span>
                  </button>
                ))}
                <p className="text-xs text-slate-600 text-center mt-2">All passwords: <code className="text-slate-400">demo123</code></p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs mt-6">
          &copy; 2026 PeoplePay360 &mdash; HR & Payroll Platform
        </p>
      </div>
    </div>
  );
}

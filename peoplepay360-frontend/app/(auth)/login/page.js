'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { session, loading: sessionLoading, csrfToken } = useAuthSession();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionLoading && session?.user && session?.user?.employeeId) {
      router.push('/employees');
    }
  }, [session, sessionLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both work email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      let token = csrfToken;
      if (!token) {
        const { data } = await apiClient.get('/api/auth/csrf');
        token = data?.csrfToken;
      }

      const params = new URLSearchParams();
      params.append('csrfToken', token || '');
      params.append('email', email);
      params.append('password', password);
      params.append('json', 'true');

      const response = await apiClient.post('/api/auth/callback/credentials', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.status === 200 || response.data?.url) {
        router.push('/employees');
        router.refresh();
      } else {
        setError('Invalid work email or password. Please try again.');
      }
    } catch (err) {
      setError('Invalid work email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">PeoplePay360</h1>
          <p className="text-sm text-slate-500 mt-1">HR & Payroll Enterprise Portal</p>
        </div>

        {/* Login Glass Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to continue to your workspace.</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-xs text-slate-400 hover:text-slate-600 cursor-not-allowed">
                  Forgot password?
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 text-xs text-slate-500">
          PeoplePay360 &copy; {new Date().getFullYear()} — Enterprise HR & Payroll Solution
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function RootHomePage() {
  const router = useRouter();
  const { user, loading } = useAuthSession();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else {
        router.replace('/employees');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 font-sans select-none">
      <div className="flex flex-col items-center gap-4 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/40 border border-indigo-500/30">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">PeoplePay360</h1>
          <p className="text-xs text-slate-400 mt-1">HR & Payroll Enterprise Platform</p>
        </div>

        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mt-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying authentication...</span>
        </div>
      </div>
    </div>
  );
}

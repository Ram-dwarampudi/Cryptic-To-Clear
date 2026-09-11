'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user?.role === 'faculty' || user?.role === 'admin' || user?.isDemoAccount) {
      router.replace('/faculty');
    } else {
      router.replace('/profile');
    }
  }, [router, user, loading]);

  return (
    <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-gold-primary">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-gold-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Redirecting to Dashboard...</span>
      </div>
    </div>
  );
}

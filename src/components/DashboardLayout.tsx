'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Loader2 } from 'lucide-react';

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const { user, setUser, isLoading, setLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (mounted) {
          setUser(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        if (mounted) {
          logout();
          router.push('/login');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (!user) {
      fetchUser();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user, setUser, setLoading, logout, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-zinc-950/50 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

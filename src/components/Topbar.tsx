'use client';

import { Menu, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function Topbar() {
  const { user } = useAuthStore();

  return (
    <header className="h-16 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-zinc-400 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center text-sm">
          <span className="text-zinc-400">Welcome back,</span>
          <span className="ml-1 font-medium text-white">{user?.full_name?.split(' ')[0]}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-zinc-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-900"></span>
        </button>
      </div>
    </header>
  );
}

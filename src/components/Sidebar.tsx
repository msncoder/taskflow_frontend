'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Settings,
  LogOut,
  Building2
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  const role = user?.role || 'employee';

  // Define navigation items based on role
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, roles: ['admin', 'manager', 'employee'] },
    { name: 'Team', href: '/dashboard/users', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Company Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin'] },
  ];

  // Filter items by user role
  const filteredNav = navItems.filter(item => item.roles.includes(role));

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-zinc-900 border-r border-zinc-800 h-screen sticky top-0 transition-all duration-300">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white tracking-tight">TaskFlow</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-400' 
                  : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-zinc-800/30">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-white">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate">{user?.full_name}</span>
            <span className="text-xs text-zinc-500 capitalize">{user?.role}</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

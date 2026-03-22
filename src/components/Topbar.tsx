'use client';

import { useState, useRef, useEffect } from 'react';
import { Menu, Bell, CheckCircle2, Circle, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

export default function Topbar() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch recent tasks to use as notifications
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiClient.get('/tasks/');
      return res.data.tasks as any[];
    },
    staleTime: 30_000,
  });

  const recent = tasks?.slice(0, 5) ?? [];
  const hasNotifications = recent.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {/* Notification Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="relative text-zinc-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-zinc-800"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-900" />
            )}
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-sm font-semibold text-white">Recent Activity</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-72 overflow-y-auto divide-y divide-zinc-800/60">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : recent.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                    <Bell className="w-8 h-8 text-zinc-700 mb-2" />
                    <p className="text-sm text-zinc-400">No recent activity</p>
                    <p className="text-xs text-zinc-600 mt-1">Tasks will appear here when created.</p>
                  </div>
                ) : (
                  recent.map((task: any) => (
                    <Link
                      key={task.id}
                      href={`/dashboard/tasks/${task.id}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {task.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${task.is_completed ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {new Date(task.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                          {task.assigned_to && ` · ${task.assigned_to.full_name.split(' ')[0]}`}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              {/* Footer */}
              {recent.length > 0 && (
                <div className="px-4 py-3 border-t border-zinc-800">
                  <Link
                    href="/dashboard/tasks"
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View all tasks →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

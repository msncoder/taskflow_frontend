'use client';

import { useAuthStore } from '@/store/auth-store';
import { CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  
  const role = user?.role || 'employee';

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Overview</h1>
        <p className="text-zinc-400">Here's what's happening in your workspace today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-zinc-700 transition-colors">
          <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
            <CheckCircle2 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Completed Tasks</p>
            <h3 className="text-2xl font-bold text-white">0</h3>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-zinc-700 transition-colors">
          <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-zinc-400 text-sm font-medium mb-1">Pending Tasks</p>
            <h3 className="text-2xl font-bold text-white">0</h3>
          </div>
        </div>

        {(role === 'admin' || role === 'manager') && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-start gap-4 hover:border-zinc-700 transition-colors">
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Team Members</p>
              <h3 className="text-2xl font-bold text-white">1</h3>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          
          <Link href="/dashboard/tasks" className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 transition-colors group">
            <div>
              <h4 className="text-sm font-medium text-white mb-1">View Tasks</h4>
              <p className="text-xs text-zinc-400">See all your assigned tasks</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
          </Link>

          {(role === 'admin' || role === 'manager') && (
            <Link href="/dashboard/users" className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 transition-colors group">
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Manage Team</h4>
                <p className="text-xs text-zinc-400">Invite new team members</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </Link>
          )}

          {role === 'admin' && (
            <Link href="/dashboard/settings" className="flex items-center justify-between p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl hover:bg-zinc-800 transition-colors group">
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Company Settings</h4>
                <p className="text-xs text-zinc-400">Manage your workspace</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </Link>
          )}
          
        </div>
      </div>
    </div>
  );
}

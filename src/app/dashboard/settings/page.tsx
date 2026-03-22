'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { Building2, Hash, Calendar, Loader2, ShieldAlert } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export default function SettingsPage() {
  const { user } = useAuthStore();

  const { data: company, isLoading, isError } = useQuery<Company>({
    queryKey: ['company'],
    queryFn: async () => {
      const res = await apiClient.get('/company/me');
      return res.data;
    },
    enabled: user?.role === 'admin',
  });

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShieldAlert className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">Access Denied</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            Only admins can view company settings.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (isError || !company) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShieldAlert className="w-12 h-12 text-red-700 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">Failed to load company data</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            There was an error fetching your company information. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(company.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Company Settings</h1>
        <p className="text-zinc-400">View and manage your workspace details.</p>
      </div>

      {/* Company Info Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-800">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Organization</h2>
            <p className="text-xs text-zinc-500">Your company profile information</p>
          </div>
        </div>

        {/* Fields */}
        <div className="divide-y divide-zinc-800">
          {/* Company Name */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-500 mb-0.5 uppercase tracking-wider">Company Name</p>
              <p className="text-base font-semibold text-white truncate">{company.name}</p>
            </div>
          </div>

          {/* Slug */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Hash className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-500 mb-0.5 uppercase tracking-wider">Workspace Slug</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-md">
                  {company.slug}
                </code>
              </div>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-center gap-4 px-6 py-5">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-500 mb-0.5 uppercase tracking-wider">Created</p>
              <p className="text-base font-medium text-zinc-200">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Company ID Card */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Company ID</p>
        <code className="text-xs font-mono text-zinc-400 break-all">{company.id}</code>
      </div>
    </div>
  );
}

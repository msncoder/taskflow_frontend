'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { UserPlus, UserX, Loader2, CheckCircle2, Clock } from 'lucide-react';
import InviteModal from '@/components/users/InviteModal';

export default function UsersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Fetch Users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users/');
      return res.data; // List[UserRead]
    },
  });

  // Fetch Invitations (Admin only technically)
  const { data: invitations } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      const res = await apiClient.get('/invitations/');
      return res.data; // List[InvitationRead]
    },
    enabled: user?.role === 'admin' || user?.role === 'manager', // Let manager try, or strict admin based on backend rules
    retry: false, // Don't retry if 403 Forbidden (managers might not have access depending on phase 3 implementation)
  });

  // Deactivate User Mutation
  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiClient.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  if (usersLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Filter out the active user themselves so they don't accidentally deactivate themselves
  const canDeactivate = user?.role === 'admin';

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Team Directory</h1>
          <p className="text-sm text-zinc-400">Manage your company's users and roles.</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users?.map((member: any) => (
                <tr key={member.id} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-medium text-white border border-zinc-700">
                        {member.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{member.full_name}</div>
                        <div className="text-zinc-500 text-xs">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium capitalize ${
                      member.role === 'admin' ? 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' : 
                      member.role === 'manager' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                      'bg-zinc-800 text-zinc-300'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {member.is_active ? (
                      <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                        <UserX className="w-3.5 h-3.5" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canDeactivate && member.id !== user.id && member.role !== 'admin' && member.is_active && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to deactivate ${member.full_name}?`)) {
                            deactivateMutation.mutate(member.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 font-medium text-xs transition-colors"
                        title="Deactivate User"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invitations Table (If any exist and user is authorized) */}
      {invitations && invitations.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-white mb-1">Pending Invitations</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {invitations.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-300">{inv.email}</td>
                      <td className="px-6 py-4 capitalize text-zinc-400">{inv.role}</td>
                      <td className="px-6 py-4">
                        {inv.is_accepted ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted
                          </span>
                        ) : new Date(inv.expires_at) < new Date() ? (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" /> Expired
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['invitations'] });
        }}
      />
    </div>
  );
}

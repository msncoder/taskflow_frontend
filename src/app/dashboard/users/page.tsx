'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import {
  UserPlus,
  UserX,
  Loader2,
  CheckCircle2,
  Clock,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import InviteModal from '@/components/users/InviteModal';

/* -------------------------------------------------------------------------- */
/* Confirm Modal                                                              */
/* -------------------------------------------------------------------------- */

interface ConfirmModalProps {
  email: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DeleteConfirmModal({
  email,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between mb-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Delete Invitation</h3>
              <p className="text-xs text-zinc-500">
                This action cannot be undone
              </p>
            </div>
          </div>

          <button onClick={onCancel}>
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <p className="text-sm text-zinc-400 mb-6">
          Revoke invitation for{' '}
          <span className="text-zinc-200 font-medium">{email}</span>?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="text-zinc-300 text-sm"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm text-white"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* API FUNCTIONS (IMPORTANT FOR STABILITY)                                    */
/* -------------------------------------------------------------------------- */

const fetchUsers = async () => {
  const res = await apiClient.get('/users/');
  return res.data;
};

const fetchInvitations = async () => {
  const res = await apiClient.get('/invitations/');
  return res.data;
};

/* -------------------------------------------------------------------------- */
/* MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

export default function UsersPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteEmail, setConfirmDeleteEmail] = useState('');

  /* ----------------------------- USERS QUERY ----------------------------- */

 const { data: users, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60, // ✅ 1 min cache
  refetchOnWindowFocus: false,
});

  /* -------------------------- INVITATIONS QUERY -------------------------- */

const { data: invitations } = useQuery({
  queryKey: ['invitations'],
  queryFn: fetchInvitations,
  enabled: user?.role === 'admin' || user?.role === 'manager',

  staleTime: 0, // 🔥 Keep invitations fresh
  refetchOnWindowFocus: true,
});

  /* --------------------------- MUTATIONS -------------------------------- */

  // deactivate user
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/users/${id}`),
    
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<any[]>(['users']);
      
      queryClient.setQueryData(['users'], (old: any[] = []) =>
        old.map((u) => (u.id === id ? { ...u, is_active: false } : u))
      );
      
      return { previous };
    },
    
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['users'], context.previous);
      }
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // delete invitation (OPTIMISTIC)
const deleteInvitationMutation = useMutation({
  mutationFn: (id: string) =>
    apiClient.delete(`/invitations/${id}`),

  // ✅ INSTANT UI UPDATE
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: ['invitations'] });

    const previous =
      queryClient.getQueryData<any[]>(['invitations']);

    queryClient.setQueryData(['invitations'], (old: any[] = []) =>
      old.filter((i) => i.id !== id)
    );

    return { previous };
  },

  // rollback if error
  onError: (_err, _id, context) => {
    if (context?.previous) {
      queryClient.setQueryData(
        ['invitations'],
        context.previous
      );
    }
  },

  // ✅ background sync ALWAYS
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['invitations'] });
  },
});

  /* --------------------------- HANDLERS -------------------------------- */

  const handleDeleteClick = (id: string, email: string) => {
    setConfirmDeleteId(id);
    setConfirmDeleteEmail(email);
  };

  const handleDeleteConfirm = () => {
    if (!confirmDeleteId) return;

    deleteInvitationMutation.mutate(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const invalidateInvitations = () => {
    queryClient.invalidateQueries({ queryKey: ['invitations'] });
  };

  /* --------------------------- LOADING -------------------------------- */

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  const canDeactivate = user?.role === 'admin';

  /* -------------------------------------------------------------------------- */
  /* UI                                                                         */
  /* -------------------------------------------------------------------------- */

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl text-white font-bold">
            Team Directory
          </h1>
          <p className="text-zinc-400 text-sm">
            Manage users and invitations
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      {/* USERS TABLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {users?.map((m: any) => (
              <tr key={m.id} className="border-b border-zinc-800">
                <td className="px-6 py-4 text-white">
                  {m.full_name}
                  <div className="text-xs text-zinc-500">
                    {m.email}
                  </div>
                </td>

                <td className="px-6 py-4 text-zinc-400 capitalize">
                  {m.role}
                </td>

                <td className="px-6 py-4">
                  {m.is_active ? (
                    <span className="text-emerald-400 flex gap-1 items-center">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="text-red-400 flex gap-1 items-center">
                      <UserX className="w-4 h-4" /> Deactivated
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  {canDeactivate &&
                    m.id !== user?.id &&
                    m.role !== 'admin' &&
                    m.is_active && (
                      <button
                        onClick={() =>
                          deactivateMutation.mutate(m.id)
                        }
                        className="text-red-400 text-xs"
                      >
                        Deactivate
                      </button>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* INVITATIONS */}
     {/* Pending Invitations Table */}
{invitations && invitations.length > 0 && (
  <div className="mt-8 space-y-4">
    <h2 className="text-xl font-bold tracking-tight text-white mb-1">
      Pending Invitations
    </h2>

    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">
                Delete
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-800">
            {invitations.map((inv: any) => (
              <tr
                key={inv.id}
                className="hover:bg-zinc-800/20 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-zinc-300">
                  {inv.email}
                </td>

                <td className="px-6 py-4 capitalize text-zinc-400">
                  {inv.role}
                </td>

                <td className="px-6 py-4">
                  {inv.is_accepted ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accepted
                    </span>
                  ) : new Date(inv.expires_at) < new Date() ? (
                    <span className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Expired
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Pending
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  {user?.role === 'admin' && !inv.is_accepted && (
                    <button
                      onClick={() =>
                        handleDeleteClick(inv.id, inv.email)
                      }
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                      title="Delete invitation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

      {/* MODALS */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onAfterInvite={invalidateInvitations}
        onSuccess={() => setIsInviteOpen(false)}
      />

      {confirmDeleteId && (
        <DeleteConfirmModal
          email={confirmDeleteEmail}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
          isLoading={deleteInvitationMutation.isPending}
        />
      )}
    </div>
  );
}
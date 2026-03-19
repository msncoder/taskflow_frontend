'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

const inviteSchema = z.object({
  email: z.string().email('Valid email is required'),
  role: z.enum(['manager', 'employee']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteModal({ isOpen, onClose, onSuccess }: InviteModalProps) {
  const { user } = useAuthStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'employee' },
  });

  const onSubmit = async (data: InviteFormValues) => {
    setServerError(null);
    try {
      await apiClient.post('/invitations/', data);
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.response?.data?.detail || 'Failed to send invite');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-2">Invite Team Member</h2>
        <p className="text-sm text-zinc-400 mb-6">Send an email invitation to join your workspace.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="block w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="colleague@company.com"
              />
            </div>
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Role</label>
            <select
              {...register('role')}
              className="block w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="employee">Employee</option>
              {user?.role === 'admin' && <option value="manager">Manager</option>}
            </select>
            {errors.role && <p className="text-sm text-red-400">{errors.role.message}</p>}
            <p className="text-xs text-zinc-500 mt-1">
              {user?.role === 'manager' 
                ? "Managers can only invite employees." 
                : "Admins can invite both managers and employees."}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              {isSubmitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

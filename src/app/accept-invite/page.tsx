'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, User, Lock, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';

const acceptInviteSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AcceptInviteFormValues = z.infer<typeof acceptInviteSchema>;

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptInviteFormValues>({
    resolver: zodResolver(acceptInviteSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const onSubmit = async (data: AcceptInviteFormValues) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch('/api/auth/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          full_name: data.full_name,
          password: data.password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to accept invitation');
      }

      const meRes = await apiClient.get('/users/me');
      setUser(meRes.data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    }
  };

  if (!token && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button onClick={() => router.push('/login')} className="text-indigo-400 hover:text-indigo-300 font-medium">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 sm:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Join Workspace</h1>
            <p className="text-zinc-400">Complete your profile to accept the invitation</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('full_name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="John Doe"
                />
              </div>
              {errors.full_name && <p className="text-sm text-red-400">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : null}
              {isSubmitting ? 'Joining...' : 'Complete Profile & Join'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

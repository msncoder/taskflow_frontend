'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, User, Building2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().min(2, 'Company name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to register');
      }

      const meRes = await apiClient.get('/users/me');
      setUser(meRes.data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 sm:p-8">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-[0%] right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Workspace</h1>
            <p className="text-zinc-400">Set up your company and admin account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('company_name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Acme Corp"
                />
              </div>
              {errors.company_name && <p className="text-sm text-red-400">{errors.company_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Admin Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('full_name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="Jane Doe"
                />
              </div>
              {errors.full_name && <p className="text-sm text-red-400">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  placeholder="jane@acme.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Password</label>
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
              disabled={isSubmitting}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
              ) : null}
              {isSubmitting ? 'Creating Workspace...' : 'Create Workspace'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-400">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  due_date: z.string().optional(),
  assigned_to_id: z.string().min(1, 'Please assign the task to someone'),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export default function NewTaskPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  // Fetch users for the assignee dropdown
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await apiClient.get('/users/');
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      // Backend expects due_date as YYYY-MM-DD or null
      const payload = {
        ...data,
        due_date: data.due_date ? data.due_date : null,
      };
      const res = await apiClient.post('/tasks/', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      router.push('/dashboard/tasks');
    },
    onError: (error: any) => {
      setServerError(error.response?.data?.detail || 'Failed to create task');
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    setServerError(null);
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/tasks" 
          className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Create Task</h1>
          <p className="text-sm text-zinc-400">Assign a new objective to a team member.</p>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {serverError && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Task Title <span className="text-red-500">*</span></label>
              <input
                {...register('title')}
                type="text"
                className="block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="E.g. Update marketing landing page"
              />
              {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className="block w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                placeholder="Add any extra context, links, or instructions..."
              />
              {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Assign To <span className="text-red-500">*</span></label>
                <select
                  {...register('assigned_to_id')}
                  disabled={usersLoading}
                  className="block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  <option value="">Select a team member...</option>
                  {users?.filter((u: any) => u.is_active).map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
                {errors.assigned_to_id && <p className="text-sm text-red-400">{errors.assigned_to_id.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Due Date</label>
                <input
                  {...register('due_date')}
                  type="date"
                  className="block w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors [color-scheme:dark]"
                />
                {errors.due_date && <p className="text-sm text-red-400">{errors.due_date.message}</p>}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex items-center justify-end gap-3">
            <Link
              href="/dashboard/tasks"
              className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || usersLoading}
              className="flex items-center px-6 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting && <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />}
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

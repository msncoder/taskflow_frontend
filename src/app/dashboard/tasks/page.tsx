'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, CheckCircle2, Circle, Clock, Loader2, Calendar } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

type FilterType = 'all' | 'mine' | 'pending' | 'completed';

export default function TasksPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiClient.get('/tasks/');
      return res.data;
    },
  });

  const getFilteredTasks = () => {
    if (!tasks) return [];
    
    return tasks.filter((task: any) => {
      switch (filter) {
        case 'mine':
          return task.assigned_to?.id === user?.id;
        case 'pending':
          return !task.is_completed;
        case 'completed':
          return task.is_completed;
        case 'all':
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Tasks</h1>
          <p className="text-sm text-zinc-400">Manage and track your workspace tasks.</p>
        </div>
        
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <Link
            href="/dashboard/tasks/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {(['all', 'mine', 'pending', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-zinc-800 text-white border border-zinc-700' 
                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center py-20 px-4 text-center">
          <CheckCircle2 className="w-12 h-12 text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No tasks found</h3>
          <p className="text-zinc-400 text-sm max-w-sm">
            {filter === 'all' 
              ? "There are no tasks in your workspace yet." 
              : `You have no ${filter} tasks matching the current filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredTasks.map((task: any) => (
            <Link 
              key={task.id} 
              href={`/dashboard/tasks/${task.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-0.5 flex-shrink-0">
                  {task.is_completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-base font-semibold truncate ${task.is_completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-zinc-500 mt-1 line-clamp-1 break-words">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-zinc-500">
                    {task.due_date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className={new Date(task.due_date) < new Date() && !task.is_completed ? 'text-red-400 font-medium' : ''}>
                          Due {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Added {new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:ml-4 sm:pl-4 sm:border-l border-zinc-800 self-start sm:self-center w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                <div className="flex -space-x-2">
                  {task.assigned_to ? (
                    <div 
                      className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white relative group/avatar cursor-help"
                      title={`Assigned to ${task.assigned_to.full_name}`}
                    >
                      {task.assigned_to.full_name.charAt(0)}
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-500" title="Unassigned">
                      ?
                    </div>
                  )}
                </div>
                {task.assigned_to && (
                  <div className="text-sm">
                    <p className="text-zinc-300 font-medium truncate max-w-[120px]">
                      {task.assigned_to.id === user?.id ? 'Me' : task.assigned_to.full_name.split(' ')[0]}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

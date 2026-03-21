'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api-client';
import { Loader2, ArrowLeft, CheckCircle2, Circle, Clock, MessageSquare, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function TaskDetailPage() {
  const { id } = useParams();
  const taskId = id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);

  // Fetch Task
  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: async () => {
      const res = await apiClient.get(`/tasks/${taskId}`);
      return res.data;
    },
  });

  // Fetch Comments
  const { data: comments, isLoading: commentsLoading } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const res = await apiClient.get(`/tasks/${taskId}/comments/`);
      return res.data; // List[CommentRead]
    },
  });

  // Toggle Completion Mutation
  const toggleMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/tasks/${taskId}/toggle-complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // Refresh list view too
    },
  });

  // Add Comment Mutation
  const addCommentMutation = useMutation({
    mutationFn: async (body: string) => {
      await apiClient.post(`/tasks/${taskId}/comments/`, { body });
    },
    onSuccess: () => {
      setCommentBody('');
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    },
    onError: (err: any) => {
      setCommentError(err.response?.data?.detail || 'Failed to post comment');
    }
  });

  // Delete Task Mutation (Admin Only)
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/tasks/${taskId}`);
    },
    onSuccess: () => {
      router.push('/dashboard/tasks');
    }
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
    }
  });

  if (taskLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20 text-zinc-400">
        Task not found or you don't have access.
      </div>
    );
  }

  const isAssignedUser = user?.id === task.assigned_to?.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/tasks" 
            className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
              task.is_completed 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {task.is_completed ? 'Completed' : 'Pending'}
            </span>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this task?')) {
                deleteTaskMutation.mutate();
              }
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8">
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-4 ${task.is_completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
            {task.title}
          </h1>
          
          {task.description ? (
            <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          ) : (
            <p className="text-zinc-500 italic">No description provided.</p>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-zinc-500 mb-2">Assigned To</p>
              <div className="flex items-center gap-3">
                {task.assigned_to ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                      {task.assigned_to.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{task.assigned_to.full_name}</p>
                      <p className="text-xs text-zinc-500 capitalize">{task.assigned_to.role}</p>
                    </div>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-zinc-500 mb-2">Task Details</p>
              <div className="space-y-2 text-sm text-zinc-300">
                {task.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Action Bar */}
        <div className="bg-zinc-950/50 border-t border-zinc-800 p-4 sm:px-8 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {task.is_completed 
              ? "Task was marked as completed." 
              : "Task is currently active."}
          </p>
          {isAssignedUser && (
            <button
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm ${
                task.is_completed 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {task.is_completed ? (
                <>
                  <Circle className="w-4 h-4" />
                  Mark Incomplete
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="pt-8">
        <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-white mb-6">
          <MessageSquare className="w-5 h-5" /> Activity & Comments
        </h2>
        
        <div className="space-y-6">
          {/* New Comment Input */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center text-sm font-bold text-zinc-300 border border-zinc-700">
              {user?.full_name?.charAt(0)}
            </div>
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-2 focus-within:border-indigo-500 transition-colors shadow-sm">
              <textarea
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Ask a question or post an update..."
                className="w-full bg-transparent border-none text-white text-sm focus:ring-0 p-2 resize-none h-20"
              />
              <div className="flex items-center justify-between px-2 pb-1 border-t border-zinc-800 pt-2 mt-2">
                <span className="text-xs text-red-400">{commentError}</span>
                <button
                  onClick={() => addCommentMutation.mutate(commentBody)}
                  disabled={!commentBody.trim() || addCommentMutation.isPending}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Comment List */}
          {commentsLoading ? (
            <div className="text-center py-6 text-zinc-500 text-sm">Loading comments...</div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-6 text-zinc-500 text-sm">No comments yet. Start the conversation!</div>
          ) : (
            <div className="space-y-6 mt-8">
              {comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 flex items-center justify-center text-sm font-bold text-zinc-300 border border-zinc-700">
                    {comment.author.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm inline-block min-w-[200px] max-w-full group">
                      <div className="flex items-baseline justify-between gap-4 mb-2">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-sm text-zinc-200">{comment.author.full_name}</span>
                          <span className="text-xs text-zinc-500">
                            {new Date(comment.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {(user?.id === comment.author.id || isAdmin) && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this comment?')) {
                                deleteCommentMutation.mutate(comment.id);
                              }
                            }}
                            className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap">{comment.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

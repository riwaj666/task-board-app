import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Task, TaskStatus, ActivityLog } from '@/lib/types';

const STATUS_NAMES: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done'
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    async function initAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Sign in anonymously
        const { data: { user }, error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error("Anonymous sign in error:", error);
          if (error.message.includes('Anonymous sign-ins are disabled')) {
            setAuthError('Anonymous sign-ins are disabled. Please enable them in your Supabase Dashboard: Authentication -> Providers -> Anonymous.');
          } else {
            setAuthError(error.message);
          }
        }
        setUser(user);
      } else {
        setUser(session.user);
      }
    }
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    async function fetchTasks() {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching tasks:", error);
      } else {
        setTasks(data || []);
      }
      setLoading(false);
    }
    
    fetchTasks();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('tasks_channel')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'tasks',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        fetchTasks(); // Refetch on any change for simplicity, or optimistically update
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const logActivity = async (taskId: string, content: string, type: ActivityLog['type']) => {
    if (!user) return;
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        task_id: taskId,
        user_id: user.id,
        content,
        type
      });
    if (error) console.error("Error logging activity:", error);
  };

  const fetchActivities = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching activities:", error);
      return [];
    }
    return data as ActivityLog[];
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId);
      
    if (error) {
      console.error("Error updating task status:", error);
      // Revert optimism if needed (omitted for brevity)
    } else {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        logActivity(taskId, `Status changed from ${STATUS_NAMES[task.status]} to ${STATUS_NAMES[newStatus]}`, 'status_change');
      }
    }
  };

  const createTask = async (task: Partial<Task>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...task, user_id: user.id }])
      .select();
      
    if (error) {
      console.error("Error creating task:", JSON.stringify(error, null, 2));
      alert(`Failed to create task: ${error.message}`);
    } else if (data) {
      setTasks(prev => [data[0], ...prev]);
      logActivity(data[0].id, `Task created`, 'creation');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
    
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId);
      
    if (error) {
      console.error("Error updating task:", JSON.stringify(error, null, 2));
      // Revert optimism if needed (omitted for brevity)
    } else {
      logActivity(taskId, `Task details updated`, 'edit');
    }
  };

  return { tasks, loading, user, authError, updateTaskStatus, createTask, updateTask, fetchActivities };
}

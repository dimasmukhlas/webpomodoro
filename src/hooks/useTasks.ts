import { useState, useEffect } from 'react';
import { Task, TaskStatus, TimeLog } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Load tasks
  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('position');
    
    if (error) {
      console.error('Error loading tasks:', error);
    } else {
      setTasks((data as Task[]) || []);
      // Set current task to the first "doing" task
      const doingTask = (data as Task[])?.find(task => task.status === 'doing');
      setCurrentTask(doingTask || null);
    }
    setLoading(false);
  };

  // Create task
  const createTask = async (title: string, description?: string) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description,
        status: 'todo',
        position: tasks.filter(t => t.status === 'todo').length,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
    } else if (data) {
      setTasks(prev => [...prev, data as Task]);
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, status } : task
        )
      );
      
      // Update current task if needed
      if (status === 'doing') {
        const task = tasks.find(t => t.id === taskId);
        if (task) setCurrentTask({ ...task, status });
      } else if (currentTask?.id === taskId) {
        setCurrentTask(null);
      }
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (currentTask?.id === taskId) {
        setCurrentTask(null);
      }
    }
  };

  // Log time for current task
  const logTime = async (duration: number, sessionType: 'work' | 'break') => {
    if (!user || !currentTask) return;

    const { error } = await supabase
      .from('time_logs')
      .insert({
        user_id: user.id,
        task_id: currentTask.id,
        duration,
        session_type: sessionType
      });

    if (error) {
      console.error('Error logging time:', error);
    } else {
      // Refresh tasks to get updated time
      loadTasks();
    }
  };

  useEffect(() => {
    if (user) {
      loadTasks();
    } else {
      setTasks([]);
      setCurrentTask(null);
    }
  }, [user]);

  return {
    tasks,
    loading,
    currentTask,
    setCurrentTask,
    createTask,
    updateTaskStatus,
    deleteTask,
    logTime,
    loadTasks
  };
};
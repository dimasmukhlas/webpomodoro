import { useState, useEffect } from 'react';
import { Task, TaskStatus, TimeLog } from '@/types/task';
import { supabase, TABLES } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Load tasks with real-time updates
  const loadTasks = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: tasksData, error } = await supabase
        .from(TABLES.TASKS)
        .select('*')
        .eq('user_id', user.uid)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error loading tasks:', error);
        setLoading(false);
        return;
      }

      const tasks = tasksData || [];
      console.log('📊 Loaded tasks from Supabase:', tasks);
      console.log('👤 User ID:', user.uid);
      setTasks(tasks);
      
      // Set current task to the first "doing" task
      const doingTask = tasks.find(task => task.status === 'doing');
      setCurrentTask(doingTask || null);
      setLoading(false);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setLoading(false);
    }
  };

  // Create task - this function creates a new task in Supabase
  const createTask = async (title: string, description?: string) => {
    if (!user) {
      console.log('❌ Cannot create task: User not authenticated');
      return;
    }

    try {
      console.log('📝 Creating task:', title);
      const taskData = {
        title,
        description: description || '',
        status: 'todo',
        position: tasks.filter(t => t.status === 'todo').length,
        user_id: user.uid,
        total_time_spent: 0,
        color: '#3b82f6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('📊 Task data:', taskData);
      const { data, error } = await supabase
        .from(TABLES.TASKS)
        .insert([taskData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating task:', error);
        return;
      }
      
      console.log('✅ Task created with ID:', data.id);
      // Reload tasks to get the updated list
      await loadTasks();
    } catch (error) {
      console.error('❌ Error creating task:', error);
    }
  };

  // Update task with any fields - this function updates a task in Supabase
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      // Convert camelCase to snake_case for Supabase
      const supabaseUpdates: any = {};
      Object.keys(updates).forEach(key => {
        if (key === 'userId') {
          supabaseUpdates.user_id = updates[key];
        } else if (key === 'total_time_spent') {
          supabaseUpdates.total_time_spent = updates[key];
        } else if (key === 'createdAt') {
          supabaseUpdates.created_at = updates[key];
        } else if (key === 'updatedAt') {
          supabaseUpdates.updated_at = updates[key];
        } else {
          supabaseUpdates[key] = updates[key];
        }
      });
      
      supabaseUpdates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from(TABLES.TASKS)
        .update(supabaseUpdates)
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task:', error);
        return;
      }
      
      // Update local state for immediate UI feedback
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
      
      // Update current task if needed - handles task status changes
      if (updates.status === 'doing') {
        const task = tasks.find(t => t.id === taskId);
        if (task) setCurrentTask({ ...task, ...updates });
      } else if (currentTask?.id === taskId && updates.status && (updates.status === 'todo' || updates.status === 'done')) {
        setCurrentTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Update task status (convenience method)
  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  // Delete task - this function removes a task from Supabase
  const deleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from(TABLES.TASKS)
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
        return;
      }
      
      // Update local state to remove the deleted task
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Clear current task if it was the one being deleted
      if (currentTask?.id === taskId) {
        setCurrentTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Log time for current task - this function creates a time log entry in Supabase
  const logTime = async (duration: number, sessionType: 'work' | 'break') => {
    if (!user) {
      console.log('❌ Cannot log time: User not authenticated');
      return;
    }
    
    if (!currentTask) {
      console.log('❌ Cannot log time: No current task selected');
      return;
    }

    try {
      console.log('⏱️ Logging time:', { duration, sessionType, task: currentTask.title });
      
      // Create a new time log entry in Supabase
      const timeLogData = {
        user_id: user.uid,
        task_id: currentTask.id,
        duration,
        session_type: sessionType,
        created_at: new Date().toISOString()
      };
      
      console.log('📊 Time log data:', timeLogData);
      const { data, error } = await supabase
        .from(TABLES.TIME_LOGS)
        .insert([timeLogData])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error logging time:', error);
        return;
      }
      
      console.log('✅ Time logged with ID:', data.id);

      // If it's a work session, update the task's total time spent
      if (sessionType === 'work') {
        const newTotalTime = currentTask.total_time_spent + duration;
        console.log('📈 Updating task time:', { 
          taskId: currentTask.id, 
          oldTime: currentTask.total_time_spent, 
          newTime: newTotalTime 
        });
        
        const { error: updateError } = await supabase
          .from(TABLES.TASKS)
          .update({ 
            total_time_spent: newTotalTime,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentTask.id);
        
        if (updateError) {
          console.error('❌ Error updating task time:', updateError);
          return;
        }
        
        console.log('✅ Task time updated successfully');
      }
    } catch (error) {
      console.error('❌ Error logging time:', error);
    }
  };

  // Load tasks when user is authenticated
  useEffect(() => {
    if (user) {
      // Load tasks from Supabase
      loadTasks();
    } else {
      // Clear tasks when user is not authenticated
      setTasks([]);
      setCurrentTask(null);
    }
  }, [user]);

  // Subscribe to realtime changes for current user's tasks
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`realtime-tasks-${user.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.TASKS,
          filter: `user_id=eq.${user.uid}`
        },
        () => {
          // Reload tasks on any change (insert/update/delete)
          loadTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.uid]);

  return {
    tasks,
    loading,
    currentTask,
    setCurrentTask,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    logTime,
    loadTasks
  };
};
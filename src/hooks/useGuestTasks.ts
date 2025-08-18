import { useState, useEffect, useCallback } from 'react';
import { Task, TaskStatus } from '@/types/task';

export const useGuestTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('guest-tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        setTasks(parsedTasks);
        // Set current task to first 'doing' task
        const doingTask = parsedTasks.find((task: Task) => task.status === 'doing');
        setCurrentTask(doingTask || null);
      } catch (error) {
        console.error('Error loading guest tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  const saveTasks = useCallback((newTasks: Task[]) => {
    localStorage.setItem('guest-tasks', JSON.stringify(newTasks));
    setTasks(newTasks);
  }, []);

  const createTask = useCallback((title: string, description?: string) => {
    const newTask: Task = {
      id: `guest-${Date.now()}`,
      title,
      description: description || '',
      status: 'todo',
      position: tasks.length,
      total_time_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'guest'
    };
    
    const newTasks = [...tasks, newTask];
    saveTasks(newTasks);
  }, [tasks, saveTasks]);

  const updateTaskStatus = useCallback((taskId: string, status: TaskStatus) => {
    const newTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, status, updated_at: new Date().toISOString() };
      }
      return task;
    });

    // If moving to 'doing', clear any other 'doing' tasks
    if (status === 'doing') {
      newTasks.forEach(task => {
        if (task.id !== taskId && task.status === 'doing') {
          task.status = 'todo';
        }
      });
      setCurrentTask(newTasks.find(task => task.id === taskId) || null);
    } else if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }

    saveTasks(newTasks);
  }, [tasks, currentTask, saveTasks]);

  const deleteTask = useCallback((taskId: string) => {
    const newTasks = tasks.filter(task => task.id !== taskId);
    
    if (currentTask?.id === taskId) {
      setCurrentTask(null);
    }
    
    saveTasks(newTasks);
  }, [tasks, currentTask, saveTasks]);

  const logTime = useCallback((duration: number, sessionType: 'work' | 'break') => {
    if (sessionType === 'work' && currentTask) {
      const newTasks = tasks.map(task => {
        if (task.id === currentTask.id) {
          return {
            ...task,
            total_time_spent: task.total_time_spent + duration,
            updated_at: new Date().toISOString()
          };
        }
        return task;
      });
      
      saveTasks(newTasks);
      setCurrentTask(prev => prev ? { ...prev, total_time_spent: prev.total_time_spent + duration } : null);
    }
  }, [currentTask, tasks, saveTasks]);

  const loadTasks = useCallback(() => {
    // For guest mode, this is already handled by useEffect
    setLoading(false);
  }, []);

  const clearGuestData = useCallback(() => {
    localStorage.removeItem('guest-tasks');
    setTasks([]);
    setCurrentTask(null);
  }, []);

  const exportGuestData = useCallback(() => {
    return {
      tasks,
      currentTaskId: currentTask?.id || null
    };
  }, [tasks, currentTask]);

  return {
    tasks,
    loading,
    currentTask,
    setCurrentTask,
    createTask,
    updateTaskStatus,
    deleteTask,
    logTime,
    loadTasks,
    clearGuestData,
    exportGuestData
  };
};
import { useState } from 'react';
import { TaskColumn } from './TaskColumn';
import { TaskForm } from './TaskForm';
import { Task, TaskStatus } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const columns: { id: TaskStatus; title: string; description: string }[] = [
  { id: 'todo', title: 'To Do', description: 'Tasks you plan to work on' },
  { id: 'doing', title: 'Doing', description: 'Currently active task' },
  { id: 'done', title: 'Done', description: 'Completed tasks' }
];

export const TaskBoard = () => {
  const { tasks, currentTask, updateTaskStatus, deleteTask, setCurrentTask } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);

  const getTasksByStatus = (status: TaskStatus): Task[] => {
    return tasks.filter(task => task.status === status);
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Only allow one task in "doing" column
    if (newStatus === 'doing') {
      const currentDoingTask = tasks.find(t => t.status === 'doing');
      if (currentDoingTask && currentDoingTask.id !== taskId) {
        // Move current doing task back to todo
        await updateTaskStatus(currentDoingTask.id, 'todo');
      }
      setCurrentTask({ ...task, status: 'doing' });
    }

    await updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Task Board</h2>
          <p className="text-muted-foreground">Organize your work with a simple kanban board</p>
        </div>
        <Button onClick={() => setShowTaskForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {currentTask && (
        <Card className="p-4 backdrop-blur-sm bg-card/80 border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Currently focusing on:</span>
            <span className="font-medium text-foreground">{currentTask.title}</span>
            <span className="text-xs text-muted-foreground">
              ({Math.floor(currentTask.total_time_spent / 60)}m tracked)
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(column => (
          <TaskColumn
            key={column.id}
            title={column.title}
            description={column.description}
            tasks={getTasksByStatus(column.id)}
            onTaskMove={handleTaskMove}
            onTaskDelete={deleteTask}
            isDoingColumn={column.id === 'doing'}
            currentTaskId={currentTask?.id}
          />
        ))}
      </div>

      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
      />
    </div>
  );
};
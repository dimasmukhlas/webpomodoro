import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { Plus, Check, X } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useGuestTasks } from '@/hooks/useGuestTasks';
import { useAuth } from '@/hooks/useAuth';

interface TaskColumnProps {
  title: string;
  description: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  onUpdateColor?: (taskId: string, color: string) => void;
  isDoingColumn?: boolean;
  currentTaskId?: string;
  columnStatus: TaskStatus;
}

export const TaskColumn = ({
  title,
  description,
  tasks,
  onTaskMove,
  onTaskDelete,
  onUpdateColor,
  isDoingColumn = false,
  currentTaskId,
  columnStatus
}: TaskColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const authenticatedTasks = useTasks();
  const guestTasks = useGuestTasks();
  const taskHooks = user ? authenticatedTasks : guestTasks;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const status = title.toLowerCase().replace(' ', '') as TaskStatus;
    onTaskMove(taskId, status);
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await taskHooks.createTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
      // If adding to "doing" column, move the task there
      if (columnStatus === 'doing') {
        // The task will be created as 'todo' by default, we need to move it
        setTimeout(() => {
          const newTask = taskHooks.tasks.find(t => t.title === newTaskTitle.trim());
          if (newTask) {
            onTaskMove(newTask.id, 'doing');
          }
        }, 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAddingTask(false);
      setNewTaskTitle('');
    }
  };

  const calculateAverageCompletionTime = () => {
    const completedTasks = tasks.filter(task => 
      task.status === 'done' && task.completed_at && task.created_at
    );
    
    if (completedTasks.length === 0) return null;
    
    const totalMs = completedTasks.reduce((sum, task) => {
      const start = new Date(task.created_at);
      const end = new Date(task.completed_at!);
      return sum + (end.getTime() - start.getTime());
    }, 0);
    
    const avgMs = totalMs / completedTasks.length;
    const avgDays = Math.floor(avgMs / (1000 * 60 * 60 * 24));
    const avgHours = Math.floor((avgMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (avgDays > 0) return `${avgDays}d ${avgHours}h`;
    if (avgHours > 0) return `${avgHours}h`;
    return '< 1h';
  };

  return (
    <Card 
      className="backdrop-blur-sm bg-card/80 border-border/50 h-fit transition-all group"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
              {tasks.length}
            </span>
            {isHovered && !isAddingTask && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingTask(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        {isDoingColumn && tasks.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Drag a task here to start focusing
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {isAddingTask && (
          <div className="flex gap-2 p-2 border-2 border-dashed border-primary/50 rounded-lg bg-background/50">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Enter task title..."
              onKeyDown={handleKeyPress}
              autoFocus
              className="text-sm"
            />
            <Button size="sm" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>
              <Check className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onTaskMove}
            onDelete={onTaskDelete}
            onUpdateColor={onUpdateColor}
            isActive={task.id === currentTaskId}
          />
        ))}
        
        {columnStatus === 'done' && tasks.length > 0 && calculateAverageCompletionTime() && (
          <div className="text-xs text-muted-foreground text-center p-2 border-t">
            Avg completion time: {calculateAverageCompletionTime()}
          </div>
        )}
        
        {tasks.length === 0 && !isAddingTask && (
          <div className="text-center py-8 text-muted-foreground">
            {isDoingColumn ? (
              <p className="text-sm italic">Drag a task here to start focusing</p>
            ) : (
              <div>
                <p className="text-sm italic">No tasks yet</p>
                {isHovered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingTask(true)}
                    className="mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add task
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
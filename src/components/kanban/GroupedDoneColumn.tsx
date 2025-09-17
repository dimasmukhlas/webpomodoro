import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types/task';
import { Plus, Check, X, Calendar } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useGuestTasks } from '@/hooks/useGuestTasks';
import { useAuth } from '@/hooks/useAuth';

interface GroupedDoneColumnProps {
  title: string;
  description: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  onUpdateColor?: (taskId: string, color: string) => void;
  currentTaskId?: string;
}

interface GroupedTasks {
  [dateKey: string]: {
    date: Date;
    tasks: Task[];
  };
}

export const GroupedDoneColumn = ({
  title,
  description,
  tasks,
  onTaskMove,
  onTaskDelete,
  onUpdateColor,
  currentTaskId
}: GroupedDoneColumnProps) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { user } = useAuth();
  const authenticatedTasks = useTasks();
  const guestTasks = useGuestTasks();
  const taskHooks = user ? authenticatedTasks : guestTasks;

  // Group tasks by completion date
  const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
    const grouped: GroupedTasks = {};
    
    tasks.forEach(task => {
      if (task.completed_at) {
        const completionDate = new Date(task.completed_at);
        const dateKey = completionDate.toDateString(); // e.g., "Mon Jan 15 2024"
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: completionDate,
            tasks: []
          };
        }
        
        grouped[dateKey].tasks.push(task);
      }
    });
    
    // Sort tasks within each group by completion time (newest first)
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].tasks.sort((a, b) => {
        const dateA = new Date(a.completed_at!);
        const dateB = new Date(b.completed_at!);
        return dateB.getTime() - dateA.getTime(); // Newest first
      });
    });
    
    return grouped;
  };

  // Sort date groups by date (newest first)
  const getSortedDateGroups = (): Array<{ dateKey: string; date: Date; tasks: Task[] }> => {
    const grouped = groupTasksByDate(tasks);
    
    return Object.keys(grouped)
      .map(dateKey => ({
        dateKey,
        date: grouped[dateKey].date,
        tasks: grouped[dateKey].tasks
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Newest date first
  };

  const formatDateHeader = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    if (isToday) {
      return 'Today';
    } else if (isYesterday) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    onTaskMove(taskId, 'done');
  };

  const handleAddTask = async () => {
    if (newTaskTitle.trim()) {
      await taskHooks.createTask(newTaskTitle.trim());
      setNewTaskTitle('');
      setIsAddingTask(false);
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

  const sortedDateGroups = getSortedDateGroups();

  return (
    <Card 
      className="blocky-card border-green-200 dark:border-green-800 h-fit transition-all group"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-300 pixel-font">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Calendar className="w-4 h-4" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">
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
      </CardHeader>
      <CardContent className="space-y-4">
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
        
        {sortedDateGroups.length > 0 ? (
          <div className="space-y-4">
            {sortedDateGroups.map(({ dateKey, date, tasks: dayTasks }) => (
              <div key={dateKey} className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <Calendar className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    {formatDateHeader(date)}
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                    {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="space-y-2 pl-2">
                  {dayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={onTaskMove}
                      onDelete={onTaskDelete}
                      onUpdateColor={onUpdateColor}
                      isActive={task.id === currentTaskId}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <div>
              <p className="text-sm italic">No completed tasks yet</p>
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
          </div>
        )}
        
        {tasks.length > 0 && calculateAverageCompletionTime() && (
          <div className="text-xs text-muted-foreground text-center p-2 border-t">
            Avg completion time: {calculateAverageCompletionTime()}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

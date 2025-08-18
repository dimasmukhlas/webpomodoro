import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types/task';

interface TaskColumnProps {
  title: string;
  description: string;
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskDelete: (taskId: string) => void;
  isDoingColumn?: boolean;
  currentTaskId?: string;
}

export const TaskColumn = ({
  title,
  description,
  tasks,
  onTaskMove,
  onTaskDelete,
  isDoingColumn = false,
  currentTaskId
}: TaskColumnProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const status = title.toLowerCase().replace(' ', '') as TaskStatus;
    onTaskMove(taskId, status);
  };

  return (
    <Card 
      className="backdrop-blur-sm bg-card/80 border-border/50 h-fit"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
            {tasks.length}
          </span>
        </div>
        <CardDescription>{description}</CardDescription>
        {isDoingColumn && tasks.length === 0 && (
          <p className="text-xs text-muted-foreground italic">
            Drag a task here to start focusing
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onMove={onTaskMove}
            onDelete={onTaskDelete}
            isActive={task.id === currentTaskId}
          />
        ))}
        {tasks.length === 0 && !isDoingColumn && (
          <p className="text-sm text-muted-foreground text-center py-8 italic">
            No tasks yet
          </p>
        )}
      </CardContent>
    </Card>
  );
};
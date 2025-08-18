import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Task, TaskStatus } from '@/types/task';
import { MoreHorizontal, Clock, Trash2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  isActive?: boolean;
}

export const TaskCard = ({ task, onMove, onDelete, isActive = false }: TaskCardProps) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const getMoveOptions = () => {
    const options = [];
    if (task.status !== 'todo') options.push({ status: 'todo', label: 'Move to To Do', icon: ArrowLeft });
    if (task.status !== 'doing') options.push({ status: 'doing', label: 'Move to Doing', icon: ArrowRight });
    if (task.status !== 'done') options.push({ status: 'done', label: 'Mark as Done', icon: CheckCircle });
    return options;
  };

  return (
    <Card 
      className={`cursor-move transition-all hover:scale-105 ${
        isActive ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm text-foreground">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            {task.total_time_spent > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{formatTime(task.total_time_spent)}</span>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {getMoveOptions().map(option => (
                <DropdownMenuItem
                  key={option.status}
                  onClick={() => onMove(task.id, option.status as TaskStatus)}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};
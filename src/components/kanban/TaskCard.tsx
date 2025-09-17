import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Task, TaskStatus } from '@/types/task';
import { MoreHorizontal, Clock, Trash2, ArrowRight, ArrowLeft, CheckCircle, Play, Timer, Palette } from 'lucide-react';
import { useState } from 'react';

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
  onUpdateColor?: (taskId: string, color: string) => void;
  isActive?: boolean;
  onStartTimer?: (task: Task) => void;
}

export const TaskCard = ({ task, onMove, onDelete, onUpdateColor, isActive = false, onStartTimer }: TaskCardProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const colorOptions = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16'
  ];
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateCompletionTime = () => {
    if (!task.completed_at || !task.created_at) return null;
    const start = new Date(task.created_at);
    const end = new Date(task.completed_at);
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    if (diffHours > 0) return `${diffHours}h`;
    return '< 1h';
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

  const handleStartTimer = () => {
    // Move task to doing if not already there
    if (task.status !== 'doing') {
      onMove(task.id, 'doing');
    }
    // Switch to timer tab
    window.dispatchEvent(new CustomEvent('switchToTimer', { detail: { task } }));
  };

  return (
    <Card 
      className={`blocky-card cursor-move transition-all hover:scale-105 ${
        isActive ? 'ring-2 ring-primary shadow-lg' : ''
      }`}
      style={{
        borderLeft: task.status === 'done' && task.color ? `4px solid ${task.color}` : undefined
      }}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 pr-2">
            <h4 className="font-medium text-sm text-foreground">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartTimer}>
                <Play className="w-4 h-4 mr-2" />
                Start Timer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {task.status === 'done' && onUpdateColor && (
                <>
                  <DropdownMenuItem onClick={() => setShowColorPicker(!showColorPicker)}>
                    <Palette className="w-4 h-4 mr-2" />
                    Change Color
                  </DropdownMenuItem>
                  {showColorPicker && (
                    <div className="p-2">
                      <div className="grid grid-cols-4 gap-1">
                        {colorOptions.map(color => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                            style={{ 
                              backgroundColor: color,
                              borderColor: task.color === color ? '#000' : 'transparent'
                            }}
                            onClick={() => {
                              onUpdateColor(task.id, color);
                              setShowColorPicker(false);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}
              {getMoveOptions().map(option => (
                <DropdownMenuItem
                  key={option.status}
                  onClick={() => onMove(task.id, option.status as TaskStatus)}
                >
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
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
        
        {/* Task metadata section */}
        <div className="space-y-1">
          {task.total_time_spent > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{formatTime(task.total_time_spent)}</span>
            </div>
          )}
          
          {task.status === 'done' && task.completed_at && (
            <div className="text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Completed {formatDate(task.completed_at)}</span>
              </div>
              {calculateCompletionTime() && (
                <div className="text-xs text-muted-foreground ml-4">
                  took {calculateCompletionTime()}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
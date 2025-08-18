import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useTimer } from '@/hooks/useTimer';
import { AuthForm } from '@/components/auth/AuthForm';
import { TaskBoard } from '@/components/kanban/TaskBoard';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Timer, KanbanSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const IntegratedApp = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { logTime, currentTask } = useTasks();
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks'>('timer');
  const { toast } = useToast();

  // Initialize timer with task tracking
  const timerHooks = useTimer((duration, sessionType) => {
    if (sessionType === 'work' && currentTask) {
      logTime(duration, sessionType);
      toast({
        title: "Session Complete!",
        description: `${Math.floor(duration / 60)} minutes logged to "${currentTask.title}"`,
      });
    }
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen p-4 transition-theme">
      {/* Overlay for better content visibility */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6 backdrop-blur-sm bg-card/80 border-border/50">
          <div className="p-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Focus & Flow</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Tab Navigation */}
              <div className="flex gap-2">
                <Button
                  variant={activeTab === 'timer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('timer')}
                  className="flex items-center gap-2"
                >
                  <Timer className="w-4 h-4" />
                  Timer
                </Button>
                <Button
                  variant={activeTab === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveTab('tasks')}
                  className="flex items-center gap-2"
                >
                  <KanbanSquare className="w-4 h-4" />
                  Tasks
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </Card>

        {/* Current Task Status */}
        {currentTask && (
          <Card className="mb-6 p-4 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Currently focusing on:</span>
                <h3 className="font-medium text-foreground">{currentTask.title}</h3>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Total time: {Math.floor(currentTask.total_time_spent / 60)}m</div>
                <div>Sessions: {timerHooks.timerState.completedSessions}</div>
              </div>
            </div>
          </Card>
        )}

        {/* No current task warning */}
        {!currentTask && activeTab === 'timer' && (
          <Card className="mb-6 p-4 backdrop-blur-sm bg-card/80 border-border/50 border-yellow-500/50">
            <div className="flex items-center gap-3 text-yellow-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="font-medium">No active task selected</p>
                <p className="text-sm">Go to Tasks tab and move a task to "Doing" to track time</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {activeTab === 'timer' ? (
          <PomodoroTimer {...timerHooks} />
        ) : (
          <TaskBoard />
        )}
      </div>
    </div>
  );
};
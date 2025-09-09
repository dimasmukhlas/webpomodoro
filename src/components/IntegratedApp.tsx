import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useGuestTasks } from '@/hooks/useGuestTasks';
import { useTimer } from '@/hooks/useTimer';
import { useGuestTimer } from '@/hooks/useGuestTimer';
import { TaskBoard } from '@/components/kanban/TaskBoard';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { Header } from '@/components/Header';
import { LoginPrompt } from '@/components/LoginPrompt';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const IntegratedApp = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks'>('timer');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const { toast } = useToast();

  // Use different hooks based on auth state
  const authenticatedTasks = useTasks();
  const guestTasks = useGuestTasks();
  const taskHooks = user ? authenticatedTasks : guestTasks;

  // Initialize timer with task tracking
  const authenticatedTimer = useTimer((duration, sessionType) => {
    if (sessionType === 'work' && taskHooks.currentTask) {
      taskHooks.logTime(duration, sessionType);
      toast({
        title: "Session Complete!",
        description: `${Math.floor(duration / 60)} minutes logged to "${taskHooks.currentTask.title}"`,
      });
    }
  });

  const guestTimer = useGuestTimer((duration, sessionType) => {
    if (sessionType === 'work' && taskHooks.currentTask) {
      taskHooks.logTime(duration, sessionType);
      toast({
        title: "Session Complete!",
        description: `${Math.floor(duration / 60)} minutes logged to "${taskHooks.currentTask.title}"`,
      });
    }
  });

  const timerHooks = user ? authenticatedTimer : guestTimer;

  // Listen for theme changes and timer events - updated for flat design
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      // Apply flat background color instead of background image
      const theme = event.detail.theme;
      if (theme) {
        document.body.className = `theme-${theme}`;
        document.body.style.transition = 'all 0.3s ease-in-out';
      }
    };

    const handleSwitchToTimer = (event: CustomEvent) => {
      setActiveTab('timer');
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    window.addEventListener('switchToTimer', handleSwitchToTimer as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
      window.removeEventListener('switchToTimer', handleSwitchToTimer as EventListener);
    };
  }, []);

  // Debug: Log authentication and data saving status
  useEffect(() => {
    console.log('🔍 App Status Check:');
    console.log('👤 User authenticated:', !!user);
    console.log('📊 Current task:', taskHooks.currentTask?.title || 'None');
    console.log('💾 Data mode:', user ? 'Firebase Database' : 'Local Storage (Guest)');
    console.log('📝 Total tasks:', taskHooks.tasks.length);
  }, [user, taskHooks.currentTask, taskHooks.tasks.length]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out",
        description: "You're now working in guest mode",
      });
    }
  };

  const handleSignIn = () => {
    setShowLoginPrompt(true);
  };

  const handleLoginSuccess = () => {
    // Transfer guest data if exists
    if (!user && 'exportGuestData' in guestTasks) {
      const guestData = guestTasks.exportGuestData();
      if (guestData.tasks.length > 0) {
        toast({
          title: "Data Migration",
          description: "Your guest data will be available in your account shortly",
        });
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Always render the app, but show different content based on auth state

  return (
    <div className="min-h-screen p-2 sm:p-4 bg-background transition-all duration-300">
      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Header 
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
        />

        {/* Data Saving Status - Apple-style status indicator */}
        <Card className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card border border-border shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user ? 'Data synced to cloud' : 'Guest mode - local storage'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user ? 'Your data is saved permanently' : 'Sign in to save data permanently'}
                </p>
              </div>
            </div>
            {!user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignIn}
                className="text-xs"
              >
                Sign In
              </Button>
            )}
          </div>
        </Card>

        {/* Current Task Status */}
        {taskHooks.currentTask && (
          <Card className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card border border-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">Currently focusing on:</span>
                  <h3 className="font-medium text-foreground truncate">{taskHooks.currentTask.title}</h3>
                </div>
              </div>
              <div className="text-left sm:text-right text-sm text-muted-foreground flex sm:flex-col gap-4 sm:gap-0">
                <div>Total time: {Math.floor(taskHooks.currentTask.total_time_spent / 60)}m</div>
                <div>Sessions: {timerHooks.timerState.completedSessions}</div>
              </div>
            </div>
          </Card>
        )}

        {/* No current task warning */}
        {!taskHooks.currentTask && activeTab === 'timer' && (
          <Card className="mb-4 sm:mb-6 p-3 sm:p-4 bg-card border border-yellow-200 shadow-sm">
            <div className="flex items-start gap-3 text-yellow-600">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mt-1"></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">No active task selected</p>
                <p className="text-sm">Go to Tasks tab and move a task to "Doing" to track time</p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content */}
        <div className="w-full overflow-hidden">
          {activeTab === 'timer' ? (
            <PomodoroTimer {...timerHooks} />
          ) : (
            <TaskBoard />
          )}
        </div>
      </div>

      {/* Login Prompt */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        onLogin={handleLoginSuccess}
        message="Sign in to save your tasks and timer progress permanently."
      />
    </div>
  );
};
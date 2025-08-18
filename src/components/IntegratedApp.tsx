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
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

  // Listen for theme changes from PomodoroTimer
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setBackgroundImage(event.detail.backgroundImage);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  // Apply background image
  useEffect(() => {
    if (backgroundImage) {
      document.body.style.backgroundImage = `url(${backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }
  }, [backgroundImage]);

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
    <div className="min-h-screen p-4 transition-theme">
      {/* Overlay for better content visibility */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-sm pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <Header 
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSignOut={handleSignOut}
          onSignIn={handleSignIn}
        />

        {/* Current Task Status */}
        {taskHooks.currentTask && (
          <Card className="mb-6 p-4 backdrop-blur-sm bg-card/80 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              <div className="flex-1">
                <span className="text-sm text-muted-foreground">Currently focusing on:</span>
                <h3 className="font-medium text-foreground">{taskHooks.currentTask.title}</h3>
                {!user && (
                  <p className="text-xs text-yellow-600 mt-1">
                    ⚠️ Guest mode - data won't be saved permanently
                  </p>
                )}
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>Total time: {Math.floor(taskHooks.currentTask.total_time_spent / 60)}m</div>
                <div>Sessions: {timerHooks.timerState.completedSessions}</div>
              </div>
            </div>
          </Card>
        )}

        {/* No current task warning */}
        {!taskHooks.currentTask && activeTab === 'timer' && (
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
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Timer, KanbanSquare, User, LogIn } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface HeaderProps {
  user: SupabaseUser | null;
  activeTab: 'timer' | 'tasks';
  setActiveTab: (tab: 'timer' | 'tasks') => void;
  onSignOut: () => void;
  onSignIn: () => void;
}

export const Header = ({ user, activeTab, setActiveTab, onSignOut, onSignIn }: HeaderProps) => {
  return (
    <Card className="mb-6 bg-card/95 backdrop-blur-md border-border/50 shadow-lg">
      <div className="p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Focus & Flow</h1>
          <p className="text-sm text-muted-foreground">
            {user ? `Welcome back, ${user.email}` : 'Working in guest mode'}
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
          
          {/* Auth Button */}
          {user ? (
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onSignIn}>
              <LogIn className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
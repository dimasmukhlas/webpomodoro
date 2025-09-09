import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LogOut, Timer, KanbanSquare, User, LogIn } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

// Header component interface - defines the props needed for the header component
interface HeaderProps {
  user: FirebaseUser | null; // Firebase user object or null if not authenticated
  activeTab: 'timer' | 'tasks'; // Current active tab in the app
  setActiveTab: (tab: 'timer' | 'tasks') => void; // Function to change active tab
  onSignOut: () => void; // Function to handle user sign out
  onSignIn: () => void; // Function to handle user sign in
}

export const Header = ({ user, activeTab, setActiveTab, onSignOut, onSignIn }: HeaderProps) => {
  return (
    <Card className="mb-4 sm:mb-6 bg-card border border-border shadow-sm">
      <div className="p-3 sm:p-4">
        {/* Top row - Title and Auth */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Focus & Flow</h1>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {user ? `Welcome back, ${user.email}` : 'Working in guest mode'}
            </p>
          </div>
          
          {/* Auth Button - Desktop */}
          <div className="hidden sm:block ml-4">
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
        
        {/* Bottom row - Navigation and mobile auth */}
        <div className="flex items-center justify-between gap-2">
          {/* Tab Navigation */}
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant={activeTab === 'timer' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
              Timer
            </Button>
            <Button
              variant={activeTab === 'tasks' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('tasks')}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
            >
              <KanbanSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              Tasks
            </Button>
          </div>
          
          {/* Auth Button - Mobile */}
          <div className="sm:hidden">
            {user ? (
              <Button variant="outline" size="sm" onClick={onSignOut} className="px-2 text-xs">
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onSignIn} className="px-2 text-xs">
                <LogIn className="w-3 h-3 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
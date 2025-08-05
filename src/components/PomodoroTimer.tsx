import { useState, useEffect } from 'react';
import { ThemeName, Theme } from '@/types/timer';
import { useTimer } from '@/hooks/useTimer';
import { ThemeSelector } from '@/components/timer/ThemeSelector';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerSettings } from '@/components/timer/TimerSettings';
import { minutesToSeconds } from '@/utils/timeUtils';

// Import background images
import seaBackground from '@/assets/sea-background.jpg';
import forestBackground from '@/assets/forest-background.jpg';
import woodfireBackground from '@/assets/woodfire-background.jpg';
import lakeBackground from '@/assets/lake-background.jpg';

const themes: Record<ThemeName, Theme> = {
  sea: {
    name: 'sea',
    displayName: 'Ocean Waves',
    backgroundImage: seaBackground,
    colors: {
      primary: 'hsl(var(--sea-primary))',
      secondary: 'hsl(var(--sea-secondary))',
      background: 'hsl(var(--sea-background))',
      card: 'hsl(var(--sea-card))',
    },
    ambientSound: '/sounds/ocean-waves.mp3',
  },
  forest: {
    name: 'forest',
    displayName: 'Forest Sounds',
    backgroundImage: forestBackground,
    colors: {
      primary: 'hsl(var(--forest-primary))',
      secondary: 'hsl(var(--forest-secondary))',
      background: 'hsl(var(--forest-background))',
      card: 'hsl(var(--forest-card))',
    },
    ambientSound: '/sounds/forest-birds.mp3',
  },
  woodfire: {
    name: 'woodfire',
    displayName: 'Crackling Fire',
    backgroundImage: woodfireBackground,
    colors: {
      primary: 'hsl(var(--woodfire-primary))',
      secondary: 'hsl(var(--woodfire-secondary))',
      background: 'hsl(var(--woodfire-background))',
      card: 'hsl(var(--woodfire-card))',
    },
    ambientSound: '/sounds/crackling-fire.mp3',
  },
  lake: {
    name: 'lake',
    displayName: 'Peaceful Lake',
    backgroundImage: lakeBackground,
    colors: {
      primary: 'hsl(var(--lake-primary))',
      secondary: 'hsl(var(--lake-secondary))',
      background: 'hsl(var(--lake-background))',
      card: 'hsl(var(--lake-card))',
    },
    ambientSound: '/sounds/lake-gentle.mp3',
  },
};

export const PomodoroTimer = () => {
  const { timerState, settings, setSettings, startTimer, pauseTimer, resetTimer } = useTimer();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('sea');

  // Apply theme styles to CSS variables
  useEffect(() => {
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Update CSS variables for current theme
    root.style.setProperty('--primary', theme.colors.primary.replace('hsl(', '').replace(')', ''));
    root.style.setProperty('--background', theme.colors.background.replace('hsl(', '').replace(')', ''));
    root.style.setProperty('--card', theme.colors.card.replace('hsl(', '').replace(')', ''));
    
    // Update background image
    document.body.style.backgroundImage = `url(${theme.backgroundImage})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
  }, [currentTheme]);

  const handleThemeChange = (theme: ThemeName) => {
    setCurrentTheme(theme);
    setSettings({ ...settings, selectedTheme: theme });
  };

  const getTotalDuration = () => {
    if (timerState.isBreak) {
      const isLongBreak = timerState.completedSessions % settings.sessionsBeforeLongBreak === 0 && timerState.completedSessions > 0;
      return minutesToSeconds(isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration);
    }
    return minutesToSeconds(settings.workDuration);
  };

  return (
    <div className="min-h-screen p-4 transition-theme">
      {/* Overlay for better content visibility */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8 animate-gentle-float">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Pomodoro Focus Timer
          </h1>
          <p className="text-muted-foreground">
            Find your focus with nature's calming sounds
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Theme Selector */}
          <div className="lg:col-span-1">
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
              themes={themes}
            />
          </div>

          {/* Timer Display */}
          <div className="lg:col-span-1">
            <TimerDisplay
              timerState={timerState}
              totalDuration={getTotalDuration()}
            />
          </div>

          {/* Timer Controls */}
          <div className="lg:col-span-1 md:col-span-2 lg:col-span-1">
            <TimerControls
              timerState={timerState}
              onStart={startTimer}
              onPause={pauseTimer}
              onReset={resetTimer}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8 text-center">
          <div className="backdrop-blur-sm bg-card/80 rounded-lg p-4 border border-border/50 inline-block">
            <p className="text-sm text-muted-foreground">
              Sessions completed today: <span className="text-foreground font-semibold">{timerState.completedSessions}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Next long break after {settings.sessionsBeforeLongBreak - (timerState.completedSessions % settings.sessionsBeforeLongBreak)} more sessions
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <TimerSettings
        settings={settings}
        onSettingsChange={setSettings}
        onClose={() => setIsSettingsOpen(false)}
        isOpen={isSettingsOpen}
      />
    </div>
  );
};
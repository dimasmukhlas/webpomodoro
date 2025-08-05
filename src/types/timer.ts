export type ThemeName = 'sea' | 'forest' | 'woodfire' | 'lake';

export interface Theme {
  name: ThemeName;
  displayName: string;
  backgroundImage: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
  };
  ambientSound: string;
}

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  completedSessions: number;
  currentCycle: number;
}

export interface TimerSettings {
  workDuration: number; // in minutes
  shortBreakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  sessionsBeforeLongBreak: number;
  selectedTheme: ThemeName;
  soundEnabled: boolean;
}
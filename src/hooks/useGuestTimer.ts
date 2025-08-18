import { useState, useEffect, useRef, useCallback } from 'react';
import { TimerState, TimerSettings } from '@/types/timer';

const DEFAULT_SETTINGS: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  selectedTheme: 'sea',
  soundEnabled: true,
};

export const useGuestTimer = (onSessionComplete?: (duration: number, sessionType: 'work' | 'break') => void) => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem('guest-timer-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = localStorage.getItem('guest-timer-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        isRunning: false // Never restore running state
      };
    }
    return {
      timeLeft: settings.workDuration * 60,
      isRunning: false,
      isBreak: false,
      completedSessions: 0,
      currentCycle: 1,
    };
  });

  const intervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('guest-timer-settings', JSON.stringify(settings));
  }, [settings]);

  // Save timer state to localStorage (but not isRunning)
  useEffect(() => {
    const stateToSave = { ...timerState, isRunning: false };
    localStorage.setItem('guest-timer-state', JSON.stringify(stateToSave));
  }, [timerState]);

  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [settings.soundEnabled]);

  const startTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState(prev => ({
      ...prev,
      timeLeft: prev.isBreak 
        ? (prev.completedSessions % settings.sessionsBeforeLongBreak === 0 && prev.completedSessions > 0
            ? settings.longBreakDuration * 60
            : settings.shortBreakDuration * 60)
        : settings.workDuration * 60,
      isRunning: false,
    }));
  }, [settings]);

  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    
    const sessionType = timerState.isBreak ? 'break' : 'work';
    const duration = timerState.isBreak 
      ? (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0 && timerState.completedSessions > 0
          ? settings.longBreakDuration * 60
          : settings.shortBreakDuration * 60)
      : settings.workDuration * 60;

    if (onSessionComplete) {
      onSessionComplete(duration, sessionType);
    }

    if (!timerState.isBreak) {
      // Work session completed, start break
      const newCompletedSessions = timerState.completedSessions + 1;
      const isLongBreak = newCompletedSessions % settings.sessionsBeforeLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;

      setTimerState({
        timeLeft: breakDuration * 60,
        isRunning: false,
        isBreak: true,
        completedSessions: newCompletedSessions,
        currentCycle: timerState.currentCycle,
      });
    } else {
      // Break completed, start work session
      setTimerState({
        timeLeft: settings.workDuration * 60,
        isRunning: false,
        isBreak: false,
        completedSessions: timerState.completedSessions,
        currentCycle: timerState.currentCycle + 1,
      });
    }
  }, [timerState, settings, onSessionComplete, playNotificationSound]);

  // Timer countdown effect
  useEffect(() => {
    if (timerState.isRunning && timerState.timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimerState(prev => {
          if (prev.timeLeft <= 1) {
            handleTimerComplete();
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerState.isRunning, timerState.timeLeft, handleTimerComplete]);

  // Update timer when settings change (only if not running)
  useEffect(() => {
    if (!timerState.isRunning) {
      setTimerState(prev => ({
        ...prev,
        timeLeft: prev.isBreak 
          ? (prev.completedSessions % settings.sessionsBeforeLongBreak === 0 && prev.completedSessions > 0
              ? settings.longBreakDuration * 60
              : settings.shortBreakDuration * 60)
          : settings.workDuration * 60
      }));
    }
  }, [settings, timerState.isRunning, timerState.isBreak, timerState.completedSessions]);

  const clearGuestData = useCallback(() => {
    localStorage.removeItem('guest-timer-settings');
    localStorage.removeItem('guest-timer-state');
    setSettings(DEFAULT_SETTINGS);
    setTimerState({
      timeLeft: DEFAULT_SETTINGS.workDuration * 60,
      isRunning: false,
      isBreak: false,
      completedSessions: 0,
      currentCycle: 1,
    });
  }, []);

  return {
    timerState,
    settings,
    setSettings,
    startTimer,
    pauseTimer,
    resetTimer,
    clearGuestData
  };
};
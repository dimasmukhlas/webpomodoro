import { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, TimerSettings } from '@/types/timer';
import { minutesToSeconds } from '@/utils/timeUtils';

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 30,
  sessionsBeforeLongBreak: 4,
  selectedTheme: 'sea',
  soundEnabled: true,
};

export const useTimer = () => {
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [timerState, setTimerState] = useState<TimerState>({
    timeLeft: minutesToSeconds(defaultSettings.workDuration),
    isRunning: false,
    isBreak: false,
    completedSessions: 0,
    currentCycle: 1,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;
    
    // Create a gentle notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [settings.soundEnabled]);

  // Start timer
  const startTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: true }));
    playNotificationSound();
  }, [playNotificationSound]);

  // Pause timer
  const pauseTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  // Reset timer
  const resetTimer = useCallback(() => {
    setTimerState({
      timeLeft: minutesToSeconds(settings.workDuration),
      isRunning: false,
      isBreak: false,
      completedSessions: 0,
      currentCycle: 1,
    });
  }, [settings.workDuration]);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    playNotificationSound();
    
    setTimerState(prev => {
      const newCompletedSessions = prev.isBreak ? prev.completedSessions : prev.completedSessions + 1;
      const shouldTakeLongBreak = newCompletedSessions > 0 && newCompletedSessions % settings.sessionsBeforeLongBreak === 0;
      
      if (prev.isBreak) {
        // Break ended, start new work session
        return {
          timeLeft: minutesToSeconds(settings.workDuration),
          isRunning: false,
          isBreak: false,
          completedSessions: newCompletedSessions,
          currentCycle: prev.currentCycle + 1,
        };
      } else {
        // Work session ended, start break
        const breakDuration = shouldTakeLongBreak ? settings.longBreakDuration : settings.shortBreakDuration;
        return {
          timeLeft: minutesToSeconds(breakDuration),
          isRunning: false,
          isBreak: true,
          completedSessions: newCompletedSessions,
          currentCycle: prev.currentCycle,
        };
      }
    });
  }, [settings, playNotificationSound]);

  // Timer countdown effect
  useEffect(() => {
    if (timerState.isRunning && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
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
      }
    };
  }, [timerState.isRunning, timerState.timeLeft, handleTimerComplete]);

  // Update timer when settings change
  useEffect(() => {
    if (!timerState.isRunning) {
      const duration = timerState.isBreak 
        ? (timerState.completedSessions % settings.sessionsBeforeLongBreak === 0 && timerState.completedSessions > 0)
          ? settings.longBreakDuration 
          : settings.shortBreakDuration
        : settings.workDuration;
      
      setTimerState(prev => ({
        ...prev,
        timeLeft: minutesToSeconds(duration)
      }));
    }
  }, [settings, timerState.isRunning, timerState.isBreak, timerState.completedSessions]);

  return {
    timerState,
    settings,
    setSettings,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};
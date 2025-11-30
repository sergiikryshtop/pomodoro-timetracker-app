import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { settingsStorage, sessionStorage, taskStorage } from '../utils/storage';

const TimerContext = createContext();

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // in seconds
  const [timerState, setTimerState] = useState('idle'); // idle, running, paused, completed
  const [intervalType, setIntervalType] = useState('work'); // work, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [currentComment, setCurrentComment] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [pausedTime, setPausedTime] = useState(null);
  const [totalPausedTime, setTotalPausedTime] = useState(0);

  const intervalRef = useRef(null);
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    configureNotifications();
  }, []);

  // Load settings
  const loadSettings = async () => {
    const loadedSettings = await settingsStorage.getSettings();
    setSettings(loadedSettings);
    setTimeRemaining(loadedSettings.workDuration * 60);
  };

  // Configure notifications
  const configureNotifications = async () => {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  };

  // Timer interval
  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
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
  }, [timerState]);

  // Handle app state changes for background timer
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        timerState === 'running'
      ) {
        // App came to foreground, recalculate time
        if (backgroundTimeRef.current) {
          const timeSpent = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
          setTimeRemaining(prev => Math.max(0, prev - timeSpent));
        }
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/) &&
        timerState === 'running'
      ) {
        // App went to background, save current time
        backgroundTimeRef.current = Date.now();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [timerState]);

  const handleTimerComplete = async () => {
    setTimerState('completed');
    
    // Play sound
    if (settings?.soundEnabled) {
      try {
        // Use system notification sound if custom sound fails
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    }

    // Vibrate
    if (settings?.vibrationEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: intervalType === 'work' ? 'Pomodoro Complete! 🎉' : 'Break Complete!',
        body: intervalType === 'work' 
          ? 'Time for a break!' 
          : 'Ready to get back to work?',
        sound: true,
      },
      trigger: null,
    });

    // Save session if work interval
    if (intervalType === 'work') {
      const session = {
        id: Date.now().toString(),
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: settings.workDuration * 60 - totalPausedTime,
        taskName: currentTask,
        comment: currentComment,
        type: 'work',
      };
      await sessionStorage.saveSession(session);
      if (currentTask) {
        await taskStorage.saveTask(currentTask);
      }

      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);

      // Auto-start break if enabled
      if (settings?.autoStartBreaks) {
        setTimeout(() => {
          startBreak();
        }, 2000);
      }
    } else {
      // Break completed, auto-start next pomodoro if enabled
      if (settings?.autoStartNextPomodoro) {
        setTimeout(() => {
          startWork();
        }, 2000);
      }
    }
  };

  const startTimer = () => {
    if (timerState === 'idle' || timerState === 'completed') {
      setStartTime(new Date());
      setTotalPausedTime(0);
      setPausedTime(null);
    } else if (timerState === 'paused') {
      // Resume from pause
      if (pausedTime) {
        const pauseDuration = Math.floor((Date.now() - pausedTime) / 1000);
        setTotalPausedTime(prev => prev + pauseDuration);
      }
      setPausedTime(null);
    }
    setTimerState('running');
    backgroundTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    setTimerState('paused');
    setPausedTime(new Date());
  };

  const resetTimer = () => {
    setTimerState('idle');
    setTimeRemaining(intervalType === 'work' 
      ? (settings?.workDuration || 25) * 60 
      : intervalType === 'longBreak'
      ? (settings?.longBreakDuration || 15) * 60
      : (settings?.shortBreakDuration || 5) * 60
    );
    setStartTime(null);
    setPausedTime(null);
    setTotalPausedTime(0);
    setCurrentTask('');
    setCurrentComment('');
  };

  const startWork = () => {
    setIntervalType('work');
    setTimeRemaining((settings?.workDuration || 25) * 60);
    resetTimer();
    startTimer();
  };

  const startBreak = () => {
    const isLongBreak = completedPomodoros > 0 && 
      completedPomodoros % (settings?.pomodorosUntilLongBreak || 4) === 0;
    
    setIntervalType(isLongBreak ? 'longBreak' : 'shortBreak');
    setTimeRemaining(isLongBreak 
      ? (settings?.longBreakDuration || 15) * 60
      : (settings?.shortBreakDuration || 5) * 60
    );
    resetTimer();
    startTimer();
  };

  const skipBreak = () => {
    resetTimer();
    setIntervalType('work');
    setTimeRemaining((settings?.workDuration || 25) * 60);
  };

  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await settingsStorage.saveSettings(updated);
    
    // Update timer if idle
    if (timerState === 'idle') {
      setTimeRemaining(updated.workDuration * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (settings?.timerFormat === 'M:SS') {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const total = intervalType === 'work'
      ? (settings?.workDuration || 25) * 60
      : intervalType === 'longBreak'
      ? (settings?.longBreakDuration || 15) * 60
      : (settings?.shortBreakDuration || 5) * 60;
    return 1 - (timeRemaining / total);
  };

  const value = {
    settings,
    timeRemaining,
    timerState,
    intervalType,
    completedPomodoros,
    currentTask,
    currentComment,
    startTime,
    formatTime,
    getProgress,
    startTimer,
    pauseTimer,
    resetTimer,
    startWork,
    startBreak,
    skipBreak,
    setCurrentTask,
    setCurrentComment,
    updateSettings,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};


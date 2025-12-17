import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { settingsStorage, sessionStorage, taskStorage } from '../utils/storage';

const TimerContext = createContext();
const NOTIFICATION_CHANNEL_ID = 'timer-complete';

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
  const lastTickRef = useRef(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    configureNotifications();
    requestNotificationPermissions();
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

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
        name: 'Timer Complete',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 400, 500],
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  };

  // Request notification permissions
  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
    }
  };

  // Handle timer completion with useCallback to prevent stale closures
  const handleTimerComplete = useCallback(async () => {
    setTimerState('completed');
    const shouldPlaySound = settings?.soundEnabled !== false;
    const shouldVibrate = settings?.vibrationEnabled !== false;
    
    // Play sound
    if (shouldPlaySound) {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      } catch (error) {
        console.error('Error configuring audio:', error);
      }
    }

    // Vibrate
    if (shouldVibrate) {
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error('Error with haptics:', error);
      }
    }

    // Send notification
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: intervalType === 'work' ? 'Pomodoro Complete! 🎉' : 'Break Complete!',
          body: intervalType === 'work' 
            ? 'Time for a break!' 
            : 'Ready to get back to work?',
          sound: shouldPlaySound ? 'default' : undefined,
        },
        trigger: null,
        ...(Platform.OS === 'android'
          ? { channelId: NOTIFICATION_CHANNEL_ID }
          : {}),
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }

    // Save session if work interval
    if (intervalType === 'work' && startTime) {
      const session = {
        id: Date.now().toString(),
        startTime: startTime.toISOString(),
        endTime: new Date().toISOString(),
        duration: (settings?.workDuration || 25) * 60 - totalPausedTime,
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
  }, [settings, intervalType, startTime, totalPausedTime, currentTask, currentComment, completedPomodoros]);

  // Timer interval
  useEffect(() => {
    if (timerState === 'running') {
      lastTickRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const now = Date.now();
          const elapsedSeconds = lastTickRef.current
            ? Math.max(1, Math.floor((now - lastTickRef.current) / 1000))
            : 1;
          lastTickRef.current = now;
          const next = Math.max(0, prev - elapsedSeconds);
          if (next === 0 && prev > 0) {
            handleTimerComplete();
          }
          return next;
        });
      }, 1000);
    } else {
      lastTickRef.current = null;
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
  }, [timerState, handleTimerComplete]);

  // Handle app state changes for background timer
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App came to foreground, recalculate time only if timer was running
        if (backgroundTimeRef.current) {
          const timeSpent = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
          setTimeRemaining(prev => {
            const newTime = Math.max(0, prev - timeSpent);
            if (newTime === 0 && prev > 0) {
              // Timer completed while in background
              handleTimerComplete();
            }
            return newTime;
          });
          backgroundTimeRef.current = null;
          lastTickRef.current = Date.now();
        }
      } else if (
        appState.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App went to background, save current time only if running
        if (timerState === 'running') {
          backgroundTimeRef.current = Date.now();
          lastTickRef.current = Date.now();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [timerState, handleTimerComplete]);



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
    lastTickRef.current = Date.now();
    backgroundTimeRef.current = Date.now();
  };

  const pauseTimer = () => {
    setTimerState('paused');
    setPausedTime(new Date());
    backgroundTimeRef.current = null;
    lastTickRef.current = null;
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
    backgroundTimeRef.current = null;
    lastTickRef.current = null;
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


import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TimerProvider, useTimer } from '../TimerContext';
import { settingsStorage, sessionStorage, taskStorage } from '../../utils/storage';

jest.mock('../../utils/storage');
jest.mock('expo-notifications');
jest.mock('expo-av');
jest.mock('expo-haptics');

describe('TimerContext', () => {
  const mockSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    pomodorosUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartNextPomodoro: false,
    soundEnabled: true,
    vibrationEnabled: true,
    notificationsEnabled: true,
  };

  const wrapper = ({ children }) => <TimerProvider>{children}</TimerProvider>;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsStorage.getSettings.mockResolvedValue(mockSettings);
    sessionStorage.saveSession.mockResolvedValue(true);
    taskStorage.saveTask.mockResolvedValue(true);
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Notifications.scheduleNotificationAsync.mockResolvedValue('notification-id');
    Notifications.setNotificationHandler.mockResolvedValue();
    Audio.setAudioModeAsync.mockResolvedValue();
    Haptics.notificationAsync.mockResolvedValue();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should throw error when useTimer is used outside provider', () => {
    const { result } = renderHook(() => {
      try {
        useTimer();
        return { error: null };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(result.current.error).toBe('useTimer must be used within TimerProvider');
  });

  it('should load settings on mount', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(settingsStorage.getSettings).toHaveBeenCalled();
      expect(result.current.settings).toEqual(mockSettings);
    });
  });

  it('should initialize with correct default state', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    expect(result.current.timeRemaining).toBe(25 * 60);
    expect(result.current.timerState).toBe('idle');
    expect(result.current.intervalType).toBe('work');
    expect(result.current.completedPomodoros).toBe(0);
    expect(result.current.currentTask).toBe('');
    expect(result.current.currentComment).toBe('');
  });

  it('should request notification permissions on mount', async () => {
    renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('should set current task', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.setCurrentTask('Test Task');
    });

    expect(result.current.currentTask).toBe('Test Task');
  });

  it('should set current comment', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.setCurrentComment('Test Comment');
    });

    expect(result.current.currentComment).toBe('Test Comment');
  });

  it('should start work timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startWork();
    });

    expect(result.current.timerState).toBe('running');
    expect(result.current.intervalType).toBe('work');
  });

  it('should pause timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startWork();
    });

    expect(result.current.timerState).toBe('running');

    act(() => {
      result.current.pauseTimer();
    });

    expect(result.current.timerState).toBe('paused');
  });

  it('should resume timer from paused state', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startWork();
      result.current.pauseTimer();
    });

    expect(result.current.timerState).toBe('paused');

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.timerState).toBe('running');
  });

  it('should reset timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startWork();
      result.current.resetTimer();
    });

    expect(result.current.timerState).toBe('idle');
    expect(result.current.timeRemaining).toBe(25 * 60);
  });

  it('should start break', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startBreak();
    });

    await waitFor(() => {
      expect(result.current.timerState).toBe('running');
      expect(result.current.intervalType).toBe('shortBreak');
    });
  });

  it('should start short break when completedPomodoros is 0', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    // With 0 completed pomodoros, startBreak should start a short break
    act(() => {
      result.current.startBreak();
    });

    await waitFor(() => {
      expect(result.current.intervalType).toBe('shortBreak');
    });
  });

  it('should skip break and return to work', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startBreak();
    });

    expect(result.current.intervalType).toBe('shortBreak');

    act(() => {
      result.current.skipBreak();
    });

    expect(result.current.timerState).toBe('idle');
    expect(result.current.intervalType).toBe('work');
    expect(result.current.timeRemaining).toBe(25 * 60);
  });

  it('should update settings', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    const newSettings = {
      ...mockSettings,
      workDuration: 30,
      shortBreakDuration: 10,
    };

    act(() => {
      result.current.updateSettings(newSettings);
    });

    expect(result.current.settings).toEqual(newSettings);
  });

  it('should update settings but maintain current time remaining', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    const initialTime = result.current.timeRemaining;
    const newSettings = {
      ...mockSettings,
      workDuration: 30,
    };

    act(() => {
      result.current.updateSettings(newSettings);
    });

    // Time remaining should not change when updating settings
    expect(result.current.timeRemaining).toBe(initialTime);
    expect(result.current.settings.workDuration).toBe(30);
  });

  it('should handle notification permission denial gracefully', async () => {
    const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    Notifications.getPermissionsAsync.mockResolvedValue({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith('Notification permissions not granted');
    });

    consoleWarn.mockRestore();
  });

  it('should handle notification permission errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    Notifications.getPermissionsAsync.mockRejectedValue(new Error('Permission error'));

    renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalledWith(
        'Error requesting notification permissions:',
        expect.any(Error)
      );
    });

    consoleError.mockRestore();
  });

  it('should provide all required context methods', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    // Verify all methods are available
    expect(typeof result.current.startWork).toBe('function');
    expect(typeof result.current.startBreak).toBe('function');
    expect(typeof result.current.startTimer).toBe('function');
    expect(typeof result.current.pauseTimer).toBe('function');
    expect(typeof result.current.resetTimer).toBe('function');
    expect(typeof result.current.skipBreak).toBe('function');
    expect(typeof result.current.updateSettings).toBe('function');
    expect(typeof result.current.setCurrentTask).toBe('function');
    expect(typeof result.current.setCurrentComment).toBe('function');
    expect(typeof result.current.formatTime).toBe('function');
    expect(typeof result.current.getProgress).toBe('function');
  });

  it('should change to paused state when pausing an idle timer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    expect(result.current.timerState).toBe('idle');

    act(() => {
      result.current.pauseTimer();
    });

    // pauseTimer will set state to paused regardless of current state
    expect(result.current.timerState).toBe('paused');
  });

  it('should set to running when calling startTimer', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    act(() => {
      result.current.startWork();
    });

    expect(result.current.timerState).toBe('running');

    act(() => {
      result.current.startTimer();
    });

    // startTimer always sets state to running
    expect(result.current.timerState).toBe('running');
  });

  it('should maintain completed pomodoros count', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    expect(result.current.completedPomodoros).toBe(0);

    // Completed pomodoros are incremented internally when work sessions complete
    // This test verifies the initial state
  });

  it('should track start time when timer starts', async () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    await waitFor(() => {
      expect(result.current.settings).toBeTruthy();
    });

    expect(result.current.startTime).toBeNull();

    act(() => {
      result.current.startWork();
    });

    expect(result.current.startTime).toBeTruthy();
  });
});

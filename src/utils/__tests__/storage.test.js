import { storage, secureStorage, sessionStorage, settingsStorage, taskStorage } from '../storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

describe('Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storage (AsyncStorage wrapper)', () => {
    it('should save item to AsyncStorage', async () => {
      const testData = { key: 'value' };
      await storage.setItem('test_key', testData);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(testData));
    });

    it('should get item from AsyncStorage', async () => {
      const testData = { key: 'value' };
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));
      
      const result = await storage.getItem('test_key');
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test_key');
      expect(result).toEqual(testData);
    });

    it('should return null when item does not exist', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await storage.getItem('nonexistent_key');
      
      expect(result).toBeNull();
    });

    it('should remove item from AsyncStorage', async () => {
      await storage.removeItem('test_key');
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
    });

    it('should handle errors gracefully when saving', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      console.error = jest.fn();
      
      await storage.setItem('test_key', { key: 'value' });
      
      expect(console.error).toHaveBeenCalledWith('Error saving to storage:', expect.any(Error));
    });
  });

  describe('secureStorage (SecureStore wrapper)', () => {
    it('should save item to SecureStore', async () => {
      const testData = { secret: 'password' };
      await secureStorage.setItem('secure_key', testData);
      
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith('secure_key', JSON.stringify(testData));
    });

    it('should get item from SecureStore', async () => {
      const testData = { secret: 'password' };
      SecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(testData));
      
      const result = await secureStorage.getItem('secure_key');
      
      expect(SecureStore.getItemAsync).toHaveBeenCalledWith('secure_key');
      expect(result).toEqual(testData);
    });

    it('should return null when secure item does not exist', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce(null);
      
      const result = await secureStorage.getItem('nonexistent_key');
      
      expect(result).toBeNull();
    });

    it('should remove item from SecureStore', async () => {
      await secureStorage.removeItem('secure_key');
      
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('secure_key');
    });
  });

  describe('sessionStorage', () => {
    beforeEach(() => {
      AsyncStorage.getItem.mockResolvedValue(null);
    });

    it('should save a new session', async () => {
      const session = {
        id: '1',
        startTime: new Date('2025-12-15T10:00:00').toISOString(),
        endTime: new Date('2025-12-15T10:25:00').toISOString(),
        duration: 1500,
        task: 'Test task',
        comment: 'Test comment'
      };

      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
      
      const result = await sessionStorage.saveSession(session);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'pomodoro_sessions',
        JSON.stringify([session])
      );
    });

    it('should get all sessions', async () => {
      const sessions = [
        { id: '1', startTime: new Date().toISOString(), duration: 1500 },
        { id: '2', startTime: new Date().toISOString(), duration: 1500 }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(sessions));
      
      const result = await sessionStorage.getSessions();
      
      expect(result).toEqual(sessions);
    });

    it('should return empty array when no sessions exist', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await sessionStorage.getSessions();
      
      expect(result).toEqual([]);
    });

    it('should filter sessions by date range', async () => {
      const sessions = [
        { id: '1', startTime: new Date('2025-12-10T10:00:00').toISOString(), duration: 1500 },
        { id: '2', startTime: new Date('2025-12-15T10:00:00').toISOString(), duration: 1500 },
        { id: '3', startTime: new Date('2025-12-20T10:00:00').toISOString(), duration: 1500 }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(sessions));
      
      const startDate = new Date('2025-12-14T00:00:00');
      const endDate = new Date('2025-12-16T23:59:59');
      
      const result = await sessionStorage.getSessionsByDateRange(startDate, endDate);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should clear all sessions', async () => {
      await sessionStorage.clearAllSessions();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('pomodoro_sessions');
    });
  });

  describe('settingsStorage', () => {
    it('should save settings to SecureStore', async () => {
      const settings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        soundEnabled: true,
        vibrationEnabled: true
      };
      
      const result = await settingsStorage.setSettings(settings);
      
      expect(result).toBe(true);
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        'pomodoro_settings',
        JSON.stringify(settings)
      );
    });

    it('should get settings from SecureStore', async () => {
      const settings = {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15
      };
      SecureStore.getItemAsync.mockResolvedValueOnce(JSON.stringify(settings));
      
      const result = await settingsStorage.getSettings();
      
      expect(result).toEqual(settings);
    });

    it('should return default settings when none exist', async () => {
      SecureStore.getItemAsync.mockResolvedValueOnce(null);
      
      const result = await settingsStorage.getSettings();
      
      expect(result).toEqual({
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartNextPomodoro: false,
        soundEnabled: true,
        vibrationEnabled: true,
        theme: 'auto',
        timerFormat: 'MM:SS',
        showTaskName: true
      });
    });
  });

  describe('taskStorage', () => {
    it('should save a new task', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));
      
      const result = await taskStorage.saveTask('Task 1');
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].name).toBe('Task 1');
      expect(savedData[0].count).toBe(1);
    });

    it('should increment count for existing task', async () => {
      const existingTasks = [{
        name: 'Task 1',
        count: 1,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(existingTasks));
      
      await taskStorage.saveTask('Task 1');
      
      const savedData = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(savedData[0].count).toBe(2);
    });

    it('should get task suggestions with query', async () => {
      const tasks = [
        { name: 'Write code', count: 3, lastUsed: new Date().toISOString(), createdAt: new Date().toISOString() },
        { name: 'Write tests', count: 2, lastUsed: new Date().toISOString(), createdAt: new Date().toISOString() }
      ];
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tasks));
      
      const result = await taskStorage.getSuggestions('write');
      
      expect(result).toHaveLength(2);
      expect(result).toContain('Write code');
    });

    it('should return empty array when no tasks exist', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await taskStorage.getTasks();
      
      expect(result).toEqual([]);
    });

    it('should limit suggestions to specified limit', async () => {
      const tasks = Array.from({ length: 20 }, (_, i) => ({
        name: `Task ${i}`,
        count: 1,
        lastUsed: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(tasks));
      
      const result = await taskStorage.getSuggestions('task', 5);
      
      expect(result).toHaveLength(5);
    });
  });
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const STORAGE_KEYS = {
  SESSIONS: 'pomodoro_sessions',
  TASKS: 'pomodoro_tasks',
  SETTINGS: 'pomodoro_settings',
};

// Secure storage for sensitive data
export const secureStorage = {
  async setItem(key, value) {
    try {
      await SecureStore.setItemAsync(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to secure storage:', error);
    }
  },

  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  },
};

// Regular storage for non-sensitive data
export const storage = {
  async setItem(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },

  async getItem(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },
};

// Session storage
export const sessionStorage = {
  async saveSession(session) {
    try {
      const sessions = await this.getSessions();
      sessions.push(session);
      await storage.setItem(STORAGE_KEYS.SESSIONS, sessions);
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  },

  async getSessions() {
    try {
      const sessions = await storage.getItem(STORAGE_KEYS.SESSIONS);
      return sessions || [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  },

  async getSessionsByDateRange(startDate, endDate) {
    try {
      const sessions = await this.getSessions();
      return sessions.filter(session => {
        const sessionDate = new Date(session.startTime);
        return sessionDate >= startDate && sessionDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting sessions by date range:', error);
      return [];
    }
  },

  async clearAllSessions() {
    try {
      await storage.removeItem(STORAGE_KEYS.SESSIONS);
      return true;
    } catch (error) {
      console.error('Error clearing sessions:', error);
      return false;
    }
  },
};

// Task storage for autosuggestion
export const taskStorage = {
  async saveTask(taskName) {
    try {
      const tasks = await this.getTasks();
      const existingTask = tasks.find(t => t.name.toLowerCase() === taskName.toLowerCase());
      
      if (existingTask) {
        existingTask.count += 1;
        existingTask.lastUsed = new Date().toISOString();
      } else {
        tasks.push({
          name: taskName,
          count: 1,
          lastUsed: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      }
      
      await storage.setItem(STORAGE_KEYS.TASKS, tasks);
      return true;
    } catch (error) {
      console.error('Error saving task:', error);
      return false;
    }
  },

  async getTasks() {
    try {
      const tasks = await storage.getItem(STORAGE_KEYS.TASKS);
      return tasks || [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  async getSuggestions(query, limit = 10) {
    try {
      const tasks = await this.getTasks();
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const filtered = tasks.filter(task => 
        task.name.toLowerCase().includes(query.toLowerCase())
      );

      // Sort by: recent (last 7 days) first, then by frequency, then alphabetically
      const sorted = filtered.sort((a, b) => {
        const aRecent = new Date(a.lastUsed) >= sevenDaysAgo;
        const bRecent = new Date(b.lastUsed) >= sevenDaysAgo;
        
        if (aRecent && !bRecent) return -1;
        if (!aRecent && bRecent) return 1;
        if (aRecent && bRecent) {
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        }
        
        if (b.count !== a.count) return b.count - a.count;
        return a.name.localeCompare(b.name);
      });

      return sorted.slice(0, limit).map(t => t.name);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },
};

// Settings storage
export const settingsStorage = {
  async saveSettings(settings) {
    try {
      await secureStorage.setItem(STORAGE_KEYS.SETTINGS, settings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  },

  async getSettings() {
    try {
      const settings = await secureStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings || this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting settings:', error);
      return this.getDefaultSettings();
    }
  },

  getDefaultSettings() {
    return {
      workDuration: 25, // minutes
      shortBreakDuration: 5, // minutes
      longBreakDuration: 15, // minutes
      pomodorosUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartNextPomodoro: false,
      soundEnabled: true,
      vibrationEnabled: true,
      theme: 'auto', // 'light', 'dark', 'auto'
      timerFormat: 'MM:SS',
      showTaskName: true,
    };
  },
};


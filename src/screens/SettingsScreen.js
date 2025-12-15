import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  Switch,
  TextInput,
  Button,
  List,
  Divider,
  Portal,
  Dialog,
  Paragraph,
} from 'react-native-paper';
import { useTimer } from '../context/TimerContext';
import { sessionStorage } from '../utils/storage';

const SettingsScreen = () => {
  const theme = useTheme();
  const { settings, updateSettings } = useTimer();
  const [localSettings, setLocalSettings] = useState(settings || {});
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSettingChange = (key, value) => {
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    updateSettings(updated);
  };

  const handleClearData = async () => {
    const success = await sessionStorage.clearAllSessions();
    if (success) {
      Alert.alert('Success', 'All data has been cleared.');
      setShowClearDialog(false);
    } else {
      Alert.alert('Error', 'Failed to clear data.');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Timer Settings
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Work Duration (minutes)</Text>
              <Text variant="bodySmall" style={styles.hint}>
                1-60 minutes
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={localSettings.workDuration?.toString() || '25'}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 1 && value <= 60) {
                  handleSettingChange('workDuration', value);
                } else if (text === '') {
                  setLocalSettings({ ...localSettings, workDuration: '' });
                }
              }}
              onBlur={() => {
                if (!localSettings.workDuration || localSettings.workDuration < 1 || localSettings.workDuration > 60) {
                  handleSettingChange('workDuration', 25);
                }
              }}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Short Break (minutes)</Text>
              <Text variant="bodySmall" style={styles.hint}>
                1-30 minutes
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={localSettings.shortBreakDuration?.toString() || '5'}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 1 && value <= 30) {
                  handleSettingChange('shortBreakDuration', value);
                } else if (text === '') {
                  setLocalSettings({ ...localSettings, shortBreakDuration: '' });
                }
              }}
              onBlur={() => {
                if (!localSettings.shortBreakDuration || localSettings.shortBreakDuration < 1 || localSettings.shortBreakDuration > 30) {
                  handleSettingChange('shortBreakDuration', 5);
                }
              }}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Long Break (minutes)</Text>
              <Text variant="bodySmall" style={styles.hint}>
                1-60 minutes
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={localSettings.longBreakDuration?.toString() || '15'}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 1 && value <= 60) {
                  handleSettingChange('longBreakDuration', value);
                } else if (text === '') {
                  setLocalSettings({ ...localSettings, longBreakDuration: '' });
                }
              }}
              onBlur={() => {
                if (!localSettings.longBreakDuration || localSettings.longBreakDuration < 1 || localSettings.longBreakDuration > 60) {
                  handleSettingChange('longBreakDuration', 15);
                }
              }}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Pomodoros Until Long Break</Text>
              <Text variant="bodySmall" style={styles.hint}>
                1-10
              </Text>
            </View>
            <TextInput
              mode="outlined"
              value={localSettings.pomodorosUntilLongBreak?.toString() || '4'}
              onChangeText={(text) => {
                const value = parseInt(text);
                if (!isNaN(value) && value >= 1 && value <= 10) {
                  handleSettingChange('pomodorosUntilLongBreak', value);
                } else if (text === '') {
                  setLocalSettings({ ...localSettings, pomodorosUntilLongBreak: '' });
                }
              }}
              onBlur={() => {
                if (!localSettings.pomodorosUntilLongBreak || localSettings.pomodorosUntilLongBreak < 1 || localSettings.pomodorosUntilLongBreak > 10) {
                  handleSettingChange('pomodorosUntilLongBreak', 4);
                }
              }}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Auto-start Breaks</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Automatically start break after work session
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartBreaks || false}
              onValueChange={(value) => handleSettingChange('autoStartBreaks', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Auto-start Next Pomodoro</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Automatically start work after break
              </Text>
            </View>
            <Switch
              value={localSettings.autoStartNextPomodoro || false}
              onValueChange={(value) => handleSettingChange('autoStartNextPomodoro', value)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Notification Settings
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Sound Notifications</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Play sound when timer completes
              </Text>
            </View>
            <Switch
              value={localSettings.soundEnabled !== false}
              onValueChange={(value) => handleSettingChange('soundEnabled', value)}
            />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Vibration</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Vibrate when timer completes
              </Text>
            </View>
            <Switch
              value={localSettings.vibrationEnabled !== false}
              onValueChange={(value) => handleSettingChange('vibrationEnabled', value)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Display Settings
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text variant="bodyLarge">Show Task Name</Text>
              <Text variant="bodySmall" style={styles.hint}>
                Display current task on timer screen
              </Text>
            </View>
            <Switch
              value={localSettings.showTaskName !== false}
              onValueChange={(value) => handleSettingChange('showTaskName', value)}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Data Management
          </Text>

          <Button
            mode="outlined"
            onPress={() => setShowClearDialog(true)}
            style={styles.dangerButton}
            textColor={theme.colors.error}
          >
            Clear All Data
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            About
          </Text>
          <Text variant="bodyMedium" style={styles.aboutText}>
            Pomodoro Timer & Focus Booster
          </Text>
          <Text variant="bodySmall" style={styles.versionText}>
            Version 1.0.0
          </Text>
        </Card.Content>
      </Card>

      <Portal>
        <Dialog
          visible={showClearDialog}
          onDismiss={() => setShowClearDialog(false)}
        >
          <Dialog.Title>Clear All Data</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete all your Pomodoro sessions? This action cannot be undone.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowClearDialog(false)}>Cancel</Button>
            <Button onPress={handleClearData} textColor={theme.colors.error}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  hint: {
    opacity: 0.6,
    marginTop: 4,
  },
  numberInput: {
    width: 80,
  },
  divider: {
    marginVertical: 8,
  },
  dangerButton: {
    marginTop: 8,
    borderColor: '#f44336',
  },
  aboutText: {
    marginBottom: 8,
  },
  versionText: {
    opacity: 0.6,
  },
});

export default SettingsScreen;


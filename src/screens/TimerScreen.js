import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Text, Card, useTheme, FAB } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import CircularTimer from '../components/CircularTimer';
import { useTimer } from '../context/TimerContext';

const TimerScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    timerState,
    intervalType,
    completedPomodoros,
    currentTask,
    startTimer,
    pauseTimer,
    resetTimer,
    startWork,
    startBreak,
    skipBreak,
    settings,
  } = useTimer();

  const getActiveColor = () => {
    return theme.colors.primary;
  };

  const handleStartPause = () => {
    if (timerState === 'idle' || timerState === 'completed') {
      if (intervalType === 'work') {
        startWork();
      } else {
        startBreak();
      }
    } else if (timerState === 'running') {
      pauseTimer();
    } else if (timerState === 'paused') {
      startTimer();
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Timer',
      'Are you sure you want to reset the timer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetTimer,
        },
      ]
    );
  };

  const handleSkipBreak = () => {
    if (intervalType !== 'work') {
      Alert.alert(
        'Skip Break',
        'Are you sure you want to skip this break?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Skip',
            style: 'destructive',
            onPress: skipBreak,
          },
        ]
      );
    }
  };

  const getButtonLabel = () => {
    if (timerState === 'idle' || timerState === 'completed') return 'Start';
    if (timerState === 'running') return 'Pause';
    return 'Resume';
  };

  const getButtonIcon = () => {
    if (timerState === 'idle' || timerState === 'completed') return 'play';
    if (timerState === 'running') return 'pause';
    return 'play';
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.timerContainer}>
        <CircularTimer size={320} strokeWidth={16} />
      </View>

      {settings?.showTaskName && currentTask && (
        <Card style={[styles.taskCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.taskRow}>
              <Icon name="check-circle" size={20} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.taskText}>
                {currentTask}
              </Text>
            </View>
          </Card.Content>
        </Card>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon
            name="timer-sand"
            size={24}
            color={theme.colors.primary}
          />
          <Text variant="headlineSmall" style={styles.statValue}>
            {completedPomodoros}
          </Text>
          <Text variant="bodySmall" style={styles.statLabel}>
            Completed
          </Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <Button
          mode="contained"
          onPress={handleStartPause}
          style={[styles.controlButton, styles.primaryButton]}
          icon={getButtonIcon()}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
        >
          {getButtonLabel()}
        </Button>

        <View style={styles.secondaryControls}>
          <Button
            mode="outlined"
            onPress={handleReset}
            style={styles.controlButton}
            icon="refresh"
            disabled={timerState === 'idle'}
          >
            Reset
          </Button>

          {intervalType !== 'work' && (
            <Button
              mode="outlined"
              onPress={handleSkipBreak}
              style={styles.controlButton}
              icon="skip-next"
            >
              Skip Break
            </Button>
          )}
        </View>
      </View>

      <FAB
        icon="pencil"
        style={[styles.fab, { backgroundColor: getActiveColor() }]}
        color="#FFFFFF"
        onPress={() => navigation.navigate('TaskInput')}
        label="Task"
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  taskCard: {
    marginVertical: 16,
    elevation: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskText: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  controlsContainer: {
    marginTop: 32,
    gap: 16,
  },
  controlButton: {
    marginVertical: 4,
  },
  primaryButton: {
    paddingVertical: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TimerScreen;


import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';
import TimerScreen from '../TimerScreen';
import { useTimer } from '../../context/TimerContext';

jest.mock('../../context/TimerContext');
jest.mock('../../components/CircularTimer', () => 'CircularTimer');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn()
  })
}));

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#6366F1'
  }
};

const renderWithProviders = (component) => {
  return render(
    <PaperProvider theme={mockTheme}>
      {component}
    </PaperProvider>
  );
};

describe('TimerScreen', () => {
  const mockTimerContext = {
    timerState: 'idle',
    intervalType: 'work',
    completedPomodoros: 0,
    currentTask: '',
    startTimer: jest.fn(),
    pauseTimer: jest.fn(),
    resetTimer: jest.fn(),
    startWork: jest.fn(),
    startBreak: jest.fn(),
    skipBreak: jest.fn(),
    settings: {
      showTaskName: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Alert.alert = jest.fn();
    useTimer.mockReturnValue(mockTimerContext);
  });

  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<TimerScreen />);

    expect(getByText('Start')).toBeTruthy();
    expect(getByText('Reset')).toBeTruthy();
    expect(getByText('Completed')).toBeTruthy();
  });

  it('should display completed pomodoros count', () => {
    mockTimerContext.completedPomodoros = 5;
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    expect(getByText('5')).toBeTruthy();
  });

  it('should display current task when set and enabled', () => {
    mockTimerContext.currentTask = 'Test Task';
    mockTimerContext.settings.showTaskName = true;
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    expect(getByText('Test Task')).toBeTruthy();
  });

  it('should not display task when showTaskName is disabled', () => {
    mockTimerContext.currentTask = 'Test Task';
    mockTimerContext.settings.showTaskName = false;
    useTimer.mockReturnValue(mockTimerContext);

    const { queryByText } = renderWithProviders(<TimerScreen />);

    expect(queryByText('Test Task')).toBeNull();
  });

  it('should start work when pressing Start button in idle state', () => {
    mockTimerContext.timerState = 'idle';
    mockTimerContext.intervalType = 'work';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const startButton = getByText('Start');
    fireEvent.press(startButton);

    expect(mockTimerContext.startWork).toHaveBeenCalled();
  });

  it('should start break when pressing Start button during break interval', () => {
    mockTimerContext.timerState = 'idle';
    mockTimerContext.intervalType = 'shortBreak';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const startButton = getByText('Start');
    fireEvent.press(startButton);

    expect(mockTimerContext.startBreak).toHaveBeenCalled();
  });

  it('should pause timer when pressing Pause button while running', () => {
    mockTimerContext.timerState = 'running';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const pauseButton = getByText('Pause');
    fireEvent.press(pauseButton);

    expect(mockTimerContext.pauseTimer).toHaveBeenCalled();
  });

  it('should resume timer when pressing Resume button while paused', () => {
    mockTimerContext.timerState = 'paused';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const resumeButton = getByText('Resume');
    fireEvent.press(resumeButton);

    expect(mockTimerContext.startTimer).toHaveBeenCalled();
  });

  it('should show reset confirmation dialog when pressing Reset button', () => {
    mockTimerContext.timerState = 'running';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const resetButton = getByText('Reset');
    fireEvent.press(resetButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Reset Timer',
      'Are you sure you want to reset the timer?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Reset' })
      ])
    );
  });

  it('should reset timer when confirming reset dialog', () => {
    mockTimerContext.timerState = 'running';
    useTimer.mockReturnValue(mockTimerContext);
    
    // Mock Alert.alert to automatically call the onPress of the Reset button
    Alert.alert = jest.fn((title, message, buttons) => {
      const resetButton = buttons.find(btn => btn.text === 'Reset');
      if (resetButton && resetButton.onPress) {
        resetButton.onPress();
      }
    });

    const { getByText } = renderWithProviders(<TimerScreen />);

    const resetButton = getByText('Reset');
    fireEvent.press(resetButton);

    expect(mockTimerContext.resetTimer).toHaveBeenCalled();
  });

  it('should render Reset button when timer is idle', () => {
    mockTimerContext.timerState = 'idle';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const resetButton = getByText('Reset');
    expect(resetButton).toBeTruthy();
    // Note: disabled prop is handled by react-native-paper Button component internally
  });

  it('should show Skip Break button during break intervals', () => {
    mockTimerContext.intervalType = 'shortBreak';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    expect(getByText('Skip Break')).toBeTruthy();
  });

  it('should not show Skip Break button during work interval', () => {
    mockTimerContext.intervalType = 'work';
    useTimer.mockReturnValue(mockTimerContext);

    const { queryByText } = renderWithProviders(<TimerScreen />);

    expect(queryByText('Skip Break')).toBeNull();
  });

  it('should show skip break confirmation dialog when pressing Skip Break', () => {
    mockTimerContext.intervalType = 'shortBreak';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    const skipButton = getByText('Skip Break');
    fireEvent.press(skipButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Skip Break',
      'Are you sure you want to skip this break?',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancel' }),
        expect.objectContaining({ text: 'Skip' })
      ])
    );
  });

  it('should skip break when confirming skip dialog', () => {
    mockTimerContext.intervalType = 'shortBreak';
    useTimer.mockReturnValue(mockTimerContext);
    
    Alert.alert = jest.fn((title, message, buttons) => {
      const skipButton = buttons.find(btn => btn.text === 'Skip');
      if (skipButton && skipButton.onPress) {
        skipButton.onPress();
      }
    });

    const { getByText } = renderWithProviders(<TimerScreen />);

    const skipButton = getByText('Skip Break');
    fireEvent.press(skipButton);

    expect(mockTimerContext.skipBreak).toHaveBeenCalled();
  });

  it('should navigate to TaskInput when pressing FAB', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      navigate: mockNavigate
    });

    const { getByText } = renderWithProviders(<TimerScreen />);

    const taskButton = getByText('Task');
    fireEvent.press(taskButton);

    expect(mockNavigate).toHaveBeenCalledWith('TaskInput');
  });

  it('should show correct button label for completed state', () => {
    mockTimerContext.timerState = 'completed';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByText } = renderWithProviders(<TimerScreen />);

    expect(getByText('Start')).toBeTruthy();
  });

  it('should render CircularTimer component', () => {
    const { UNSAFE_getByType } = renderWithProviders(<TimerScreen />);

    expect(UNSAFE_getByType('CircularTimer')).toBeTruthy();
  });
});

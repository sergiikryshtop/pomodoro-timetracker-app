import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Alert } from 'react-native';
import SettingsScreen from '../SettingsScreen';
import { useTimer } from '../../context/TimerContext';
import { sessionStorage } from '../../utils/storage';

jest.mock('../../context/TimerContext');
jest.mock('../../utils/storage');

// Mock Alert
jest.spyOn(Alert, 'alert');

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#6366F1',
    elevation: {
      level3: '#F5F5F5'
    }
  }
};

const renderWithProviders = (component) => {
  return render(
    <PaperProvider theme={mockTheme}>
      {component}
    </PaperProvider>
  );
};

describe('SettingsScreen', () => {
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
    showTaskName: true,
  };

  const mockUpdateSettings = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    useTimer.mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings,
    });
    sessionStorage.clearAllSessions.mockResolvedValue(true);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);

    expect(getByText('Timer Settings')).toBeTruthy();
    expect(getByText('Work Duration (minutes)')).toBeTruthy();
    expect(getByText('Short Break (minutes)')).toBeTruthy();
    expect(getByText('Long Break (minutes)')).toBeTruthy();
    expect(getByText('Notification Settings')).toBeTruthy();
    expect(getByText('Display Settings')).toBeTruthy();
    expect(getByText('Data Management')).toBeTruthy();
  });

  it('should display current settings values', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    expect(getByDisplayValue('25')).toBeTruthy();
    expect(getByDisplayValue('5')).toBeTruthy();
    expect(getByDisplayValue('15')).toBeTruthy();
    expect(getByDisplayValue('4')).toBeTruthy();
  });

  it('should update work duration setting', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const workDurationInput = getByDisplayValue('25');
    fireEvent.changeText(workDurationInput, '30');

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ workDuration: 30 })
    );
  });

  it('should validate work duration min/max values', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const workDurationInput = getByDisplayValue('25');
    
    // Test value > 60
    fireEvent.changeText(workDurationInput, '70');
    expect(mockUpdateSettings).not.toHaveBeenCalledWith(
      expect.objectContaining({ workDuration: 70 })
    );

    // Test value < 1
    fireEvent.changeText(workDurationInput, '0');
    expect(mockUpdateSettings).not.toHaveBeenCalledWith(
      expect.objectContaining({ workDuration: 0 })
    );
  });

  it('should reset work duration to default on blur if invalid', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const workDurationInput = getByDisplayValue('25');
    fireEvent.changeText(workDurationInput, '');
    fireEvent(workDurationInput, 'blur');

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ workDuration: 25 })
    );
  });

  it('should update short break duration setting', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const shortBreakInput = getByDisplayValue('5');
    fireEvent.changeText(shortBreakInput, '10');

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ shortBreakDuration: 10 })
    );
  });

  it('should validate short break duration range (1-30)', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const shortBreakInput = getByDisplayValue('5');
    
    fireEvent.changeText(shortBreakInput, '35');
    expect(mockUpdateSettings).not.toHaveBeenCalledWith(
      expect.objectContaining({ shortBreakDuration: 35 })
    );
  });

  it('should update long break duration setting', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const longBreakInput = getByDisplayValue('15');
    fireEvent.changeText(longBreakInput, '20');

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ longBreakDuration: 20 })
    );
  });

  it('should update pomodoros until long break setting', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const pomodorosInput = getByDisplayValue('4');
    fireEvent.changeText(pomodorosInput, '6');

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ pomodorosUntilLongBreak: 6 })
    );
  });

  it('should validate pomodoros until long break range (1-10)', () => {
    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);

    const pomodorosInput = getByDisplayValue('4');
    
    fireEvent.changeText(pomodorosInput, '15');
    expect(mockUpdateSettings).not.toHaveBeenCalledWith(
      expect.objectContaining({ pomodorosUntilLongBreak: 15 })
    );
  });

  it('should toggle auto-start breaks switch', () => {
    const { getAllByRole } = renderWithProviders(<SettingsScreen />);

    const switches = getAllByRole('switch');
    const autoStartBreaksSwitch = switches[0]; // First switch
    
    fireEvent(autoStartBreaksSwitch, 'valueChange', true);

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ autoStartBreaks: true })
    );
  });

  it('should toggle sound enabled switch', () => {
    const { getAllByRole } = renderWithProviders(<SettingsScreen />);

    const switches = getAllByRole('switch');
    // Sound switch is after autoStartBreaks and autoStartNextPomodoro
    const soundSwitch = switches[2];
    
    fireEvent(soundSwitch, 'valueChange', false);

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ soundEnabled: false })
    );
  });

  it('should toggle vibration enabled switch', () => {
    const { getAllByRole } = renderWithProviders(<SettingsScreen />);

    const switches = getAllByRole('switch');
    const vibrationSwitch = switches[3];
    
    fireEvent(vibrationSwitch, 'valueChange', false);

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ vibrationEnabled: false })
    );
  });

  it('should toggle show task name switch', () => {
    const { getAllByRole } = renderWithProviders(<SettingsScreen />);

    const switches = getAllByRole('switch');
    // There are 5 switches total (autoStartBreaks, autoStartNextPomodoro, soundEnabled, vibrationEnabled, showTaskName)
    const showTaskSwitch = switches[4]; // 5th switch (index 4)
    
    fireEvent(showTaskSwitch, 'valueChange', false);

    expect(mockUpdateSettings).toHaveBeenCalledWith(
      expect.objectContaining({ showTaskName: false })
    );
  });

  it('should show clear data confirmation dialog', () => {
    const { getByText, getAllByText } = renderWithProviders(<SettingsScreen />);

    const clearDataButton = getByText('Clear All Data');
    fireEvent.press(clearDataButton);

    // Dialog renders with title and button both showing "Clear All Data"
    const clearDataTexts = getAllByText('Clear All Data');
    expect(clearDataTexts.length).toBeGreaterThan(0);
    expect(getByText(/Are you sure you want to delete all your Pomodoro sessions/)).toBeTruthy();
  });

  it('should clear data when confirmed', async () => {
    const { getByText } = renderWithProviders(<SettingsScreen />);

    const clearDataButton = getByText('Clear All Data');
    fireEvent.press(clearDataButton);

    const confirmButton = getByText('Delete');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(sessionStorage.clearAllSessions).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith('Success', 'All data has been cleared.');
    });
  });

  it('should cancel clear data dialog', () => {
    const { getByText, queryByText } = renderWithProviders(<SettingsScreen />);

    const clearDataButton = getByText('Clear All Data');
    fireEvent.press(clearDataButton);

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(sessionStorage.clearAllSessions).not.toHaveBeenCalled();
  });

  it('should show error alert if clear data fails', async () => {
    sessionStorage.clearAllSessions.mockResolvedValue(false);

    const { getByText } = renderWithProviders(<SettingsScreen />);

    const clearDataButton = getByText('Clear All Data');
    fireEvent.press(clearDataButton);

    const confirmButton = getByText('Delete');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Error', 'Failed to clear data.');
    });
  });

  it('should update local settings when context settings change', () => {
    const { rerender } = renderWithProviders(<SettingsScreen />);

    const newSettings = { ...mockSettings, workDuration: 30 };
    useTimer.mockReturnValue({
      settings: newSettings,
      updateSettings: mockUpdateSettings,
    });

    rerender(
      <PaperProvider theme={mockTheme}>
        <SettingsScreen />
      </PaperProvider>
    );

    const { getByDisplayValue } = renderWithProviders(<SettingsScreen />);
    expect(getByDisplayValue('30')).toBeTruthy();
  });
});

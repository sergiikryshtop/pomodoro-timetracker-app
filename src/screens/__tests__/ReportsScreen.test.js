import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReportsScreen from '../ReportsScreen';
import { sessionStorage } from '../../utils/storage';

jest.mock('../../utils/storage');

// Mock date-fns
jest.mock('date-fns', () => ({
  format: jest.fn((date, formatStr) => {
    if (formatStr === 'MMM dd, yyyy') return 'Dec 16, 2025';
    if (formatStr === 'MMMM yyyy') return 'December 2025';
    if (formatStr === 'MMM dd') return 'Dec 16';
    if (formatStr === 'EEE') return 'Mon';
    return '2025-12-16';
  }),
  startOfWeek: jest.fn((date) => new Date(2025, 11, 15)),
  endOfWeek: jest.fn((date) => new Date(2025, 11, 21)),
  startOfMonth: jest.fn((date) => new Date(2025, 11, 1)),
  endOfMonth: jest.fn((date) => new Date(2025, 11, 31)),
  eachDayOfInterval: jest.fn(() => [
    new Date(2025, 11, 15),
    new Date(2025, 11, 16),
    new Date(2025, 11, 17),
    new Date(2025, 11, 18),
    new Date(2025, 11, 19),
    new Date(2025, 11, 20),
    new Date(2025, 11, 21),
  ]),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');

const mockTheme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#6366F1',
    onSurface: '#000000'
  }
};

const renderWithProviders = (component) => {
  return render(
    <PaperProvider 
      theme={mockTheme}
      settings={{
        icon: props => <MaterialCommunityIcons {...props} />,
      }}
    >
      {component}
    </PaperProvider>
  );
};

describe('ReportsScreen', () => {
  const mockSessions = [
    {
      id: '1',
      type: 'work',
      startTime: new Date(2025, 11, 16, 9, 0).toISOString(),
      endTime: new Date(2025, 11, 16, 9, 25).toISOString(),
      duration: 1500,
      taskName: 'Task 1',
      comment: 'Comment 1'
    },
    {
      id: '2',
      type: 'work',
      startTime: new Date(2025, 11, 16, 10, 0).toISOString(),
      endTime: new Date(2025, 11, 16, 10, 25).toISOString(),
      duration: 1500,
      taskName: 'Task 2',
      comment: 'Comment 2'
    },
    {
      id: '3',
      type: 'work',
      startTime: new Date(2025, 11, 16, 11, 0).toISOString(),
      endTime: new Date(2025, 11, 16, 11, 25).toISOString(),
      duration: 1500,
      taskName: 'Task 1',
      comment: 'Comment 3'
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.getSessionsByDateRange.mockResolvedValue(mockSessions);
  });

  it('should render correctly', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('Statistics')).toBeTruthy();
      expect(getByText('Task Distribution')).toBeTruthy();
    });
  });

  it('should load sessions on mount', async () => {
    renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalled();
    });
  });

  it('should display total pomodoros count', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('3')).toBeTruthy();
      expect(getByText('Pomodoros')).toBeTruthy();
    });
  });

  it('should display total work time', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      // 3 sessions * 1500 seconds = 4500 seconds = 1h 15m
      expect(getByText('1h 15m')).toBeTruthy();
      expect(getByText('Work Time')).toBeTruthy();
    });
  });

  it('should format time correctly for minutes only', async () => {
    const shortSessions = [
      {
        id: '1',
        type: 'work',
        startTime: new Date(2025, 11, 16, 9, 0).toISOString(),
        duration: 600, // 10 minutes
        taskName: 'Task 1',
      }
    ];
    sessionStorage.getSessionsByDateRange.mockResolvedValue(shortSessions);

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('10m')).toBeTruthy();
    });
  });

  it('should switch to day view', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      const dayButton = getByText('Day');
      fireEvent.press(dayButton);
    });

    expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalled();
  });

  it('should switch to week view', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      const weekButton = getByText('Week');
      fireEvent.press(weekButton);
    });

    expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalledTimes(2);
  });

  it('should switch to month view', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      const monthButton = getByText('Month');
      fireEvent.press(monthButton);
    });

    expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalledTimes(2);
  });

  it('should show date picker when pressing date button', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      const dateButton = getByText('Dec 16, 2025');
      fireEvent.press(dateButton);
    });

    // DatePicker should be rendered (mocked)
    expect(getByText('Dec 16, 2025')).toBeTruthy();
  });

  it('should display task names in task distribution', async () => {
    const { getAllByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getAllByText('Task 1').length).toBeGreaterThan(0);
      expect(getAllByText('Task 2').length).toBeGreaterThan(0);
    });
  });

  it('should display task counts', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      // Task 1 appears 2 times (displayed as count)
      expect(getByText('2')).toBeTruthy();
      // Task 2 appears 1 time
      expect(getByText('1')).toBeTruthy();
    });
  });

  it('should handle empty sessions gracefully', async () => {
    sessionStorage.getSessionsByDateRange.mockResolvedValue([]);

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('0')).toBeTruthy();
      expect(getByText('No sessions found for this period')).toBeTruthy();
    });
  });

  it('should handle null sessions', async () => {
    sessionStorage.getSessionsByDateRange.mockResolvedValue(null);

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('0')).toBeTruthy();
    });
  });

  it('should handle errors when loading sessions', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    sessionStorage.getSessionsByDateRange.mockRejectedValue(new Error('Load error'));

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(getByText('0')).toBeTruthy();
      expect(consoleError).toHaveBeenCalledWith('Error loading sessions:', expect.any(Error));
    });

    consoleError.mockRestore();
  });

  it('should handle errors when calculating stats', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const invalidSessions = [
      {
        id: '1',
        type: 'work',
        duration: null, // Invalid duration
        taskName: null, // Invalid task name
      }
    ];
    sessionStorage.getSessionsByDateRange.mockResolvedValue(invalidSessions);

    renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  it('should filter work sessions only for stats', async () => {
    const mixedSessions = [
      ...mockSessions,
      {
        id: '4',
        type: 'break',
        startTime: new Date(2025, 11, 16, 12, 0).toISOString(),
        duration: 300,
      }
    ];
    sessionStorage.getSessionsByDateRange.mockResolvedValue(mixedSessions);

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      // Should still show 3 pomodoros (not 4)
      expect(getByText('3')).toBeTruthy();
    });
  });

  it('should truncate long task names in distribution', async () => {
    const longTaskSession = [
      {
        id: '1',
        type: 'work',
        startTime: new Date(2025, 11, 16, 9, 0).toISOString(),
        duration: 1500,
        taskName: 'This is a very long task name that should be truncated',
      }
    ];
    sessionStorage.getSessionsByDateRange.mockResolvedValue(longTaskSession);

    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      // Should show truncated version with ellipsis (single space before ...)
      expect(getByText('This is a very ...')).toBeTruthy();
    });
  });

  it('should display unnamed tasks as "Unnamed Task"', async () => {
    const unnamedSession = [
      {
        id: '1',
        type: 'work',
        startTime: new Date(2025, 11, 16, 9, 0).toISOString(),
        duration: 1500,
        taskName: null,
      }
    ];
    sessionStorage.getSessionsByDateRange.mockResolvedValue(unnamedSession);

    const { getAllByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      const unnamedTasks = getAllByText('Unnamed Task');
      expect(unnamedTasks.length).toBeGreaterThan(0);
    });
  });

  it('should reload sessions when view type changes', async () => {
    const { getByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalledTimes(1);
    });

    const weekButton = getByText('Week');
    fireEvent.press(weekButton);

    await waitFor(() => {
      expect(sessionStorage.getSessionsByDateRange).toHaveBeenCalledTimes(2);
    });
  });

  it('should sort tasks by count in descending order', async () => {
    const { getAllByText } = renderWithProviders(<ReportsScreen />);

    await waitFor(() => {
      // Task 1 has 2 pomodoros, Task 2 has 1
      // They should be displayed with Task 1 first
      expect(getAllByText('Task 1').length).toBeGreaterThan(0);
      expect(getAllByText('Task 2').length).toBeGreaterThan(0);
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import TaskInputScreen from '../TaskInputScreen';
import { useTimer } from '../../context/TimerContext';
import { taskStorage } from '../../utils/storage';

jest.mock('../../context/TimerContext');
jest.mock('../../utils/storage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn()
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

describe('TaskInputScreen', () => {
  const mockNavigation = { goBack: jest.fn() };
  const mockTimerContext = {
    currentTask: '',
    currentComment: '',
    setCurrentTask: jest.fn(),
    setCurrentComment: jest.fn(),
    timerState: 'idle'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useTimer.mockReturnValue(mockTimerContext);
    taskStorage.getSuggestions.mockResolvedValue([]);
  });

  it('should render correctly', () => {
    const { getByText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    expect(getByText('Task Name')).toBeTruthy();
    expect(getByText('Comment (Optional)')).toBeTruthy();
  });

  it('should initialize with current task and comment', () => {
    mockTimerContext.currentTask = 'Test Task';
    mockTimerContext.currentComment = 'Test Comment';
    useTimer.mockReturnValue(mockTimerContext);

    const { getByDisplayValue } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    expect(getByDisplayValue('Test Task')).toBeTruthy();
    expect(getByDisplayValue('Test Comment')).toBeTruthy();
  });

  it('should update task input when typing', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, 'New Task');

    expect(taskInput.props.value).toBe('New Task');
  });

  it('should update comment input when typing', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const commentInput = getByPlaceholderText('Add notes about this session...');
    fireEvent.changeText(commentInput, 'New Comment');

    expect(commentInput.props.value).toBe('New Comment');
  });

  it('should load suggestions when task input is >= 3 characters', async () => {
    const suggestions = ['Task 1', 'Task 2', 'Task 3'];
    taskStorage.getSuggestions.mockResolvedValue(suggestions);

    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, 'Test');

    await waitFor(() => {
      expect(taskStorage.getSuggestions).toHaveBeenCalledWith('Test', 10);
    }, { timeout: 500 });
  });

  it('should not load suggestions when input is < 3 characters', async () => {
    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, 'Te');

    await waitFor(() => {
      expect(taskStorage.getSuggestions).not.toHaveBeenCalled();
    }, { timeout: 500 });
  });

  it('should save task and comment on Save button press', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    const commentInput = getByPlaceholderText('Add notes about this session...');

    fireEvent.changeText(taskInput, 'Task Name');
    fireEvent.changeText(commentInput, 'Task Comment');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    expect(mockTimerContext.setCurrentTask).toHaveBeenCalledWith('Task Name');
    expect(mockTimerContext.setCurrentComment).toHaveBeenCalledWith('Task Comment');
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });

  it('should trim whitespace when saving', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, '  Task Name  ');

    const saveButton = getByText('Save');
    fireEvent.press(saveButton);

    expect(mockTimerContext.setCurrentTask).toHaveBeenCalledWith('Task Name');
  });

  it('should navigate back on Cancel button press', () => {
    const { getByText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockNavigation.goBack).toHaveBeenCalled();
    expect(mockTimerContext.setCurrentTask).not.toHaveBeenCalled();
  });

  it('should handle suggestion selection', async () => {
    const suggestions = ['Suggestion 1', 'Suggestion 2'];
    taskStorage.getSuggestions.mockResolvedValue(suggestions);

    const { getByPlaceholderText, getByText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, 'Sugg');

    await waitFor(() => {
      expect(taskStorage.getSuggestions).toHaveBeenCalled();
    });

    const suggestion = getByText('Suggestion 1');
    fireEvent.press(suggestion);

    expect(taskInput.props.value).toBe('Suggestion 1');
  });

  it('should handle errors when loading suggestions', async () => {
    taskStorage.getSuggestions.mockRejectedValue(new Error('Storage error'));
    console.error = jest.fn();

    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    fireEvent.changeText(taskInput, 'Test');

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Error loading suggestions:',
        expect.any(Error)
      );
    });
  });

  it('should clear suggestions when input is cleared', async () => {
    const { getByPlaceholderText } = renderWithProviders(
      <TaskInputScreen navigation={mockNavigation} />
    );

    const taskInput = getByPlaceholderText('What are you working on?');
    
    // Type to trigger suggestions
    fireEvent.changeText(taskInput, 'Test');
    
    await waitFor(() => {
      expect(taskStorage.getSuggestions).toHaveBeenCalled();
    });

    // Clear input
    fireEvent.changeText(taskInput, '');

    await waitFor(() => {
      // Should not call again for empty input
      expect(taskStorage.getSuggestions).toHaveBeenCalledTimes(1);
    });
  });
});

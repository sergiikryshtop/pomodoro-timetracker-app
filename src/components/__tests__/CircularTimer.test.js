import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CircularTimer from '../CircularTimer';
import { useTimer } from '../../context/TimerContext';

jest.mock('../../context/TimerContext');

const mockTheme = {
  colors: {
    primary: '#6366F1',
    outline: '#E5E7EB',
    workColor: '#10B981',
    breakColor: '#3B82F6',
    longBreakColor: '#8B5CF6'
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

describe('CircularTimer', () => {
  const mockTimerContext = {
    timeRemaining: 1500, // 25 minutes in seconds
    intervalType: 'work',
    formatTime: jest.fn((time) => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }),
    getProgress: jest.fn(() => 0.5),
    timerState: 'stopped'
  };

  beforeEach(() => {
    useTimer.mockReturnValue(mockTimerContext);
  });

  it('should render correctly', () => {
    const { getByText } = renderWithProviders(<CircularTimer />);
    
    expect(mockTimerContext.formatTime).toHaveBeenCalled();
  });

  it('should display formatted time', () => {
    mockTimerContext.timeRemaining = 1500;
    mockTimerContext.formatTime.mockReturnValue('25:00');
    
    const { getByText } = renderWithProviders(<CircularTimer />);
    
    expect(getByText('25:00')).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { root } = renderWithProviders(<CircularTimer size={250} />);
    
    expect(root).toBeTruthy();
  });

  it('should render with custom stroke width', () => {
    const { root } = renderWithProviders(<CircularTimer strokeWidth={15} />);
    
    expect(root).toBeTruthy();
  });

  it('should show correct time during work interval', () => {
    mockTimerContext.intervalType = 'work';
    mockTimerContext.timeRemaining = 900; // 15 minutes
    mockTimerContext.formatTime.mockReturnValue('15:00');
    
    const { getByText } = renderWithProviders(<CircularTimer />);
    
    expect(getByText('15:00')).toBeTruthy();
  });

  it('should show correct time during break interval', () => {
    mockTimerContext.intervalType = 'shortBreak';
    mockTimerContext.timeRemaining = 300; // 5 minutes
    mockTimerContext.formatTime.mockReturnValue('05:00');
    
    const { getByText } = renderWithProviders(<CircularTimer />);
    
    expect(getByText('05:00')).toBeTruthy();
  });

  it('should calculate progress correctly', () => {
    mockTimerContext.getProgress.mockReturnValue(0.75);
    
    renderWithProviders(<CircularTimer />);
    
    expect(mockTimerContext.getProgress).toHaveBeenCalled();
  });

  it('should update when timer state changes', () => {
    const { rerender } = renderWithProviders(<CircularTimer />);
    
    mockTimerContext.timeRemaining = 1200;
    mockTimerContext.formatTime.mockReturnValue('20:00');
    
    rerender(
      <PaperProvider theme={mockTheme}>
        <CircularTimer />
      </PaperProvider>
    );
    
    expect(mockTimerContext.formatTime).toHaveBeenCalledWith(1200);
  });
});

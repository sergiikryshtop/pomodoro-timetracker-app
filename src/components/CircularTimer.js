import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  useEffect as reanimatedUseEffect,
} from 'react-native-reanimated';
import { Text, useTheme } from 'react-native-paper';
import { useTimer } from '../context/TimerContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularTimer = ({ size = 300, strokeWidth = 12 }) => {
  const theme = useTheme();
  const { timeRemaining, intervalType, formatTime, getProgress, timerState } = useTimer();
  const progress = useSharedValue(0);
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const radius = (size - strokeWidth) / 2;

  // Update progress animation
  reanimatedUseEffect(() => {
    progress.value = withTiming(getProgress(), { duration: 300 });
  }, [timeRemaining]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  const getColor = () => {
    if (intervalType === 'work') return theme.colors.workColor;
    if (intervalType === 'longBreak') return theme.colors.longBreakColor;
    return theme.colors.breakColor;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.surface}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text
          variant="displayMedium"
          style={[
            styles.timeText,
            { color: getColor() },
            timerState === 'paused' && styles.pausedText,
          ]}
        >
          {formatTime(timeRemaining)}
        </Text>
        <Text
          variant="labelLarge"
          style={[styles.typeText, { color: theme.colors.text }]}
        >
          {intervalType === 'work'
            ? 'Focus Time'
            : intervalType === 'longBreak'
            ? 'Long Break'
            : 'Short Break'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 48,
    letterSpacing: 2,
  },
  pausedText: {
    opacity: 0.6,
  },
  typeText: {
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
});

export default CircularTimer;


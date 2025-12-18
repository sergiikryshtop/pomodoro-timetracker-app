import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
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
  useEffect(() => {
    progress.value = withTiming(getProgress(), { duration: 300 });
  }, [timeRemaining, getProgress]);

  const animatedProps = useAnimatedProps(() => {
    // progress.value goes from 0 (start) to 1 (finish)
    // We want to show remaining time, so invert it
    const remaining = 1 - progress.value;
    // strokeDashoffset: 0 = fully visible, circumference = fully hidden
    const strokeDashoffset = circumference * (1 - remaining);
    return {
      strokeDashoffset,
    };
  });

  const getColor = () => {
    if (intervalType === 'work') {
      return theme.colors.primary;
    }
    if (intervalType === 'longBreak') {
      return theme.colors.longBreakColor || theme.colors.breakColor || theme.colors.primary;
    }
    return theme.colors.breakColor || theme.colors.primary;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.outline}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.2}
        />
        {/* Progress circle - starts at 12 o'clock and empties clockwise */}
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
          {intervalType === 'work' ? 'Focus Time' : 'Break Time'}
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


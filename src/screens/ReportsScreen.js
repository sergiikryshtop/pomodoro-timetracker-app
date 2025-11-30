import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  Card,
  useTheme,
  SegmentedButtons,
  Button,
  List,
  Divider,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { sessionStorage } from '../utils/storage';
// Charts - using victory-native if available, otherwise fallback to simple visualizations
let VictoryBar, VictoryChart, VictoryPie, VictoryLine, VictoryAxis, VictoryTheme;
try {
  const victory = require('victory-native');
  VictoryBar = victory.VictoryBar;
  VictoryChart = victory.VictoryChart;
  VictoryPie = victory.VictoryPie;
  VictoryLine = victory.VictoryLine;
  VictoryAxis = victory.VictoryAxis;
  VictoryTheme = victory.VictoryTheme;
} catch (e) {
  console.warn('Victory charts not available, using fallback');
}

const ReportsScreen = () => {
  const theme = useTheme();
  const [viewType, setViewType] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({
    totalPomodoros: 0,
    totalWorkTime: 0,
    tasks: {},
  });

  useEffect(() => {
    loadSessions();
  }, [viewType, selectedDate]);

  const loadSessions = async () => {
    let startDate, endDate;

    if (viewType === 'day') {
      startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);
    } else if (viewType === 'week') {
      startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
      endDate = endOfWeek(selectedDate, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(selectedDate);
      endDate = endOfMonth(selectedDate);
    }

    const loadedSessions = await sessionStorage.getSessionsByDateRange(startDate, endDate);
    setSessions(loadedSessions);
    calculateStats(loadedSessions);
  };

  const calculateStats = (sessionsData) => {
    const workSessions = sessionsData.filter(s => s.type === 'work');
    const totalPomodoros = workSessions.length;
    const totalWorkTime = workSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const tasks = {};

    workSessions.forEach(session => {
      const taskName = session.taskName || 'Unnamed Task';
      if (!tasks[taskName]) {
        tasks[taskName] = { count: 0, time: 0 };
      }
      tasks[taskName].count += 1;
      tasks[taskName].time += session.duration || 0;
    });

    setStats({ totalPomodoros, totalWorkTime, tasks });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getDateLabel = () => {
    if (viewType === 'day') {
      return format(selectedDate, 'MMM dd, yyyy');
    } else if (viewType === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM dd')} - ${format(end, 'MMM dd, yyyy')}`;
    } else {
      return format(selectedDate, 'MMMM yyyy');
    }
  };

  const getTaskDistributionData = () => {
    const entries = Object.entries(stats.tasks)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([name, data], index) => ({
        x: name.length > 15 ? name.substring(0, 15) + '...' : name,
        y: data.count,
        label: `${data.count}`,
      }));
    return entries;
  };

  const getProductivityData = () => {
    if (viewType === 'week') {
      const weekDays = eachDayOfInterval({
        start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
        end: endOfWeek(selectedDate, { weekStartsOn: 1 }),
      });
      return weekDays.map(day => {
        const daySessions = sessions.filter(s => {
          const sessionDate = new Date(s.startTime);
          return sessionDate.toDateString() === day.toDateString();
        });
        return {
          x: format(day, 'EEE'),
          y: daySessions.length,
        };
      });
    } else if (viewType === 'month') {
      // Group by week for monthly view
      const weeks = [];
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      let current = start;
      while (current <= end) {
        const weekEnd = new Date(current);
        weekEnd.setDate(current.getDate() + 6);
        if (weekEnd > end) weekEnd.setTime(end.getTime());
        
        const weekSessions = sessions.filter(s => {
          const sessionDate = new Date(s.startTime);
          return sessionDate >= current && sessionDate <= weekEnd;
        });
        
        weeks.push({
          x: `Week ${weeks.length + 1}`,
          y: weekSessions.length,
        });
        
        current = new Date(weekEnd);
        current.setDate(current.getDate() + 1);
      }
      return weeks;
    }
    return [];
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <SegmentedButtons
        value={viewType}
        onValueChange={setViewType}
        buttons={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
        ]}
        style={styles.segmentedButtons}
      />

      <View style={styles.dateSelector}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          icon="calendar"
        >
          {getDateLabel()}
        </Button>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode={viewType === 'month' ? 'date' : 'date'}
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Statistics
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {stats.totalPomodoros}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Pomodoros
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="headlineMedium" style={styles.statValue}>
                {formatTime(stats.totalWorkTime)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                Work Time
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {Object.keys(stats.tasks).length > 0 && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Task Distribution
            </Text>
            {VictoryChart && VictoryBar && VictoryPie ? (
              viewType === 'day' ? (
                <View style={styles.chartContainer}>
                  <VictoryChart
                    theme={VictoryTheme.material}
                    height={200}
                    padding={{ left: 60, right: 20, top: 20, bottom: 40 }}
                  >
                    <VictoryAxis />
                    <VictoryAxis dependentAxis />
                    <VictoryBar
                      data={getTaskDistributionData()}
                      style={{ data: { fill: theme.colors.primary } }}
                    />
                  </VictoryChart>
                </View>
              ) : (
                <View style={styles.chartContainer}>
                  <VictoryPie
                    data={getTaskDistributionData()}
                    colorScale={['#E53935', '#FF6B6B', '#FF8A80', '#FFAB91', '#FFCCBC']}
                    height={250}
                    labelRadius={({ innerRadius }) => innerRadius + 20}
                  />
                </View>
              )
            ) : (
              <View style={styles.simpleChartContainer}>
                {getTaskDistributionData().slice(0, 5).map((item, index) => (
                  <View key={index} style={styles.barItem}>
                    <View style={styles.barLabelContainer}>
                      <Text variant="bodySmall" style={styles.barLabel}>{item.x}</Text>
                      <Text variant="bodySmall" style={styles.barValue}>{item.y}</Text>
                    </View>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${(item.y / Math.max(...getTaskDistributionData().map(d => d.y))) * 100}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {(viewType === 'week' || viewType === 'month') && (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Productivity Trend
            </Text>
            {VictoryChart && VictoryLine ? (
              <View style={styles.chartContainer}>
                <VictoryChart
                  theme={VictoryTheme.material}
                  height={200}
                  padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
                >
                  <VictoryAxis />
                  <VictoryAxis dependentAxis />
                  <VictoryLine
                    data={getProductivityData()}
                    style={{ data: { stroke: theme.colors.primary } }}
                  />
                </VictoryChart>
              </View>
            ) : (
              <View style={styles.simpleChartContainer}>
                {getProductivityData().map((item, index) => (
                  <View key={index} style={styles.trendItem}>
                    <Text variant="bodySmall" style={styles.trendLabel}>{item.x}</Text>
                    <View style={styles.trendBarContainer}>
                      <View
                        style={[
                          styles.trendBar,
                          {
                            width: `${(item.y / Math.max(...getProductivityData().map(d => d.y), 1)) * 100}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                      <Text variant="bodySmall" style={styles.trendValue}>{item.y}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Sessions
          </Text>
          {sessions.length === 0 ? (
            <Text variant="bodyMedium" style={styles.emptyText}>
              No sessions found for this period
            </Text>
          ) : (
            sessions
              .filter(s => s.type === 'work')
              .map((session, index) => (
                <React.Fragment key={session.id || index}>
                  <List.Item
                    title={session.taskName || 'Unnamed Task'}
                    description={
                      `${formatTime(session.duration || 0)} • ${format(new Date(session.startTime), 'HH:mm')}`
                    }
                    left={(props) => (
                      <List.Icon {...props} icon="timer" color={theme.colors.primary} />
                    )}
                  />
                  {session.comment && (
                    <Text variant="bodySmall" style={styles.comment}>
                      {session.comment}
                    </Text>
                  )}
                  {index < sessions.length - 1 && <Divider />}
                </React.Fragment>
              ))
          )}
        </Card.Content>
      </Card>
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
  segmentedButtons: {
    marginBottom: 16,
  },
  dateSelector: {
    marginBottom: 16,
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: 'bold',
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginVertical: 20,
  },
  comment: {
    marginLeft: 56,
    marginBottom: 8,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  simpleChartContainer: {
    marginTop: 16,
    paddingVertical: 8,
  },
  barItem: {
    marginBottom: 12,
  },
  barLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  barLabel: {
    flex: 1,
  },
  barValue: {
    fontWeight: 'bold',
  },
  barBackground: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 10,
  },
  trendItem: {
    marginBottom: 12,
  },
  trendLabel: {
    marginBottom: 4,
  },
  trendBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendBar: {
    height: 16,
    borderRadius: 8,
    minWidth: 4,
  },
  trendValue: {
    fontWeight: 'bold',
    minWidth: 30,
  },
});

export default ReportsScreen;


import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  useTheme,
  List,
  Divider,
} from 'react-native-paper';
import { useTimer } from '../context/TimerContext';
import { taskStorage } from '../utils/storage';

const TaskInputScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    currentTask,
    currentComment,
    setCurrentTask,
    setCurrentComment,
    timerState,
  } = useTimer();

  const [taskInput, setTaskInput] = useState(currentTask || '');
  const [commentInput, setCommentInput] = useState(currentComment || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, [taskInput]);

  const loadSuggestions = async () => {
    if (taskInput.length >= 3) {
      const suggs = await taskStorage.getSuggestions(taskInput, 10);
      setSuggestions(suggs);
      setShowSuggestions(suggs.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSave = () => {
    setCurrentTask(taskInput.trim());
    setCurrentComment(commentInput.trim());
    navigation.goBack();
  };

  const handleSuggestionSelect = (suggestion) => {
    setTaskInput(suggestion);
    setShowSuggestions(false);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Task Name
          </Text>
          <TextInput
            mode="outlined"
            placeholder="What are you working on?"
            value={taskInput}
            onChangeText={setTaskInput}
            maxLength={200}
            style={styles.input}
            autoFocus
          />
          {showSuggestions && (
            <Card style={styles.suggestionsCard}>
              <Card.Content style={styles.suggestionsContent}>
                {suggestions.map((suggestion, index) => (
                  <React.Fragment key={index}>
                    <List.Item
                      title={suggestion}
                      onPress={() => handleSuggestionSelect(suggestion)}
                      left={(props) => (
                        <List.Icon {...props} icon="clock-outline" />
                      )}
                    />
                    {index < suggestions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </Card.Content>
            </Card>
          )}
        </Card.Content>
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.label}>
            Comment (Optional)
          </Text>
          <TextInput
            mode="outlined"
            placeholder="Add notes about this session..."
            value={commentInput}
            onChangeText={setCommentInput}
            maxLength={500}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
          <Text variant="bodySmall" style={styles.charCount}>
            {commentInput.length}/500
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={handleCancel}
          style={styles.button}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
        >
          Save
        </Button>
      </View>
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
  label: {
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  charCount: {
    textAlign: 'right',
    opacity: 0.6,
  },
  suggestionsCard: {
    marginTop: 8,
    maxHeight: 300,
  },
  suggestionsContent: {
    padding: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default TaskInputScreen;


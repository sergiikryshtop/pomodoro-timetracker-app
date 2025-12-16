import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import TimerScreen from './src/screens/TimerScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TaskInputScreen from './src/screens/TaskInputScreen';
import { TimerProvider } from './src/context/TimerContext';
import { theme } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TimerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TimerMain" component={TimerScreen} />
      <Stack.Screen 
        name="TaskInput" 
        component={TaskInputScreen}
        options={{ 
          presentation: 'modal',
          headerShown: true,
          title: 'Task & Comment'
        }}
      />
    </Stack.Navigator>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider 
        theme={theme}
        settings={{
          icon: props => <MaterialCommunityIcons {...props} />,
        }}
      >
        <TimerProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconName;

                  if (route.name === 'Timer') {
                    iconName = focused ? 'timer' : 'timer-outline';
                  } else if (route.name === 'Reports') {
                    iconName = focused ? 'chart-box' : 'chart-box-outline';
                  } else if (route.name === 'Settings') {
                    iconName = focused ? 'cog' : 'cog-outline';
                  }

                  return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
              })}
            >
              <Tab.Screen name="Timer" component={TimerStack} />
              <Tab.Screen name="Reports" component={ReportsScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
            </Tab.Navigator>
          </NavigationContainer>
        </TimerProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default App;


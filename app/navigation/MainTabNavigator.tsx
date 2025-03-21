import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { Platform, StyleSheet } from 'react-native';

// Import screens
import HomeScreen from '../screens/main/HomeScreen';
import GroupsScreen from '../screens/main/GroupsScreen';
import ActivityScreen from '../screens/main/ActivityScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { tabScreenOptions } from '../utils/navigationTheme';
import { colors, shadows } from '../utils/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<MainTabParamList, keyof MainTabParamList> }) => ({
        ...tabScreenOptions,
        headerShown: false, // Hide headers for all tabs since we use custom ScreenHeader
        tabBarIcon: ({ focused, color, size }: TabBarIconProps) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Circles') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Settle') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: Platform.OS === 'ios' ? '500' : 'normal',
        },
        // iOS-style tab bar with blur effect
        tabBarStyle: {
          ...styles.tabBar,
          height: Platform.OS === 'ios' ? 84 : 60, // Adjusted height for iOS (includes safe area)
          paddingBottom: Platform.OS === 'ios' ? 24 : 8, // Account for safe area on iOS
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Circles" 
        component={GroupsScreen} 
        options={{ 
          title: 'Circles',
        }}
      />
      <Tab.Screen 
        name="Settle" 
        component={ActivityScreen} 
        options={{ 
          title: 'Settle',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.secondary,
    borderTopColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : colors.border.light,
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 8,
      },
    }),
  },
}); 
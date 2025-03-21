import { DefaultTheme, Theme } from '@react-navigation/native';
import { colors, fontSizes, fontWeights } from './theme';
import { Platform } from 'react-native';

// Custom theme for navigation based on Apple's Human Interface Guidelines
export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background.secondary,
    card: colors.background.secondary,
    text: colors.text.primary,
    border: colors.border.light,
    notification: colors.accent,
  },
};

// Configuration for stack navigators
export const stackScreenOptions = {
  headerTitleStyle: {
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  headerBackTitleVisible: true,
  headerTintColor: colors.primary,
  headerStyle: {
    backgroundColor: colors.background.secondary,
    shadowColor: 'transparent', // iOS
    elevation: 0, // Android
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  contentStyle: {
    backgroundColor: colors.background.primary,
  },
};

// Configuration for tab navigators (iOS style)
export const tabScreenOptions = {
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.text.tertiary,
  tabBarStyle: {
    backgroundColor: colors.background.secondary,
    borderTopWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderTopColor: Platform.OS === 'ios' ? 'rgba(0,0,0,0.1)' : colors.border.light,
  },
  tabBarLabelStyle: {
    fontSize: fontSizes.xs,
    fontWeight: Platform.OS === 'ios' ? '500' : '400' as const,
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  headerStyle: {
    backgroundColor: colors.background.secondary,
    shadowColor: 'transparent', // iOS
    elevation: 0, // Android
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitleStyle: {
    fontSize: fontSizes.md,
    fontWeight: '600' as const,
    color: colors.text.primary,
  },
  headerTitleAlign: 'center' as const,
}; 
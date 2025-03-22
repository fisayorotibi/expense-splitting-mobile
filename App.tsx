import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import { AuthProvider } from './app/context/AuthContext';
import { RootNavigator } from './app/navigation/RootNavigator';
import { NavigationContainer, LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from './app/navigation/types';
import { setupAuthURLListener } from './app/services/auth';
import { navigationTheme } from './app/utils/navigationTheme';

export default function App() {
  // Handle deep links for auth flow
  useEffect(() => {
    // Set up auth URL listener for email confirmation and OAuth flows
    const cleanupListener = setupAuthURLListener();
    return cleanupListener;
  }, []);

  // Set up deep linking configuration
  const linking: LinkingOptions<RootStackParamList> = {
    prefixes: [
      'expense-splitter://',
      'exp://',
      Linking.createURL('/')
    ],
    config: {
      initialRouteName: 'Auth',
      screens: {
        Auth: {
          path: 'auth',
          initialRouteName: 'Login',
          screens: {
            Login: '',
            Register: 'register',
            ForgotPassword: 'forgot-password',
            AuthCallback: 'callback',
            VerifyCode: 'verify'
          }
        },
        Main: {
          path: 'main',
          screens: {
            Home: 'home',
            Circles: 'circles',
            Settle: 'settle',
            Profile: 'profile',
          }
        },
        GroupStack: {
          path: 'groups',
          screens: {
            GroupsList: 'list',
            GroupDetails: 'details/:groupId',
            CreateGroup: 'create',
            EditGroup: 'edit/:groupId',
            GroupMembers: 'members/:groupId',
            InviteMember: 'invite/:groupId'
          }
        },
        ExpenseStack: {
          path: 'expenses',
          screens: {
            AddNewExpense: 'add/:groupId?',
            ExpenseDetails: 'details/:expenseId',
            EditExpense: 'edit/:expenseId'
          }
        }
      }
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <NavigationContainer theme={navigationTheme} linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

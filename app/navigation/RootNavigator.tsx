import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { supabase } from '../services/supabase';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { Session } from '@supabase/supabase-js';
import { stackScreenOptions } from '../utils/navigationTheme';
import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { session, profile, loading } = useAuth();

  // If auth context is still loading, show nothing
  if (loading) {
    return null;
  }

  // We require both a valid session AND a profile to consider the user logged in
  const isAuthenticated = !!session && !!profile;

  return (
    <Stack.Navigator 
      screenOptions={{ 
        ...stackScreenOptions,
        headerShown: false 
      }}
    >
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}; 
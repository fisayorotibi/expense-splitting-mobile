import React, { useEffect } from 'react';
import { createStackNavigator, CardStyleInterpolators, TransitionPresets } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import { stackScreenOptions } from '../utils/navigationTheme';
import { Easing, Platform, AppState } from 'react-native';
import { StackCardInterpolationProps, StackCardInterpolatedStyle } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import AuthCallbackScreen from '../screens/auth/AuthCallbackScreen';
import VerifyCodeScreen from '../screens/auth/VerifyCodeScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import Onboarding1Screen from '../screens/auth/Onboarding1Screen';
import Onboarding2Screen from '../screens/auth/Onboarding2Screen';
import Onboarding3Screen from '../screens/auth/Onboarding3Screen';

// Import new signup flow screens
import EnterEmailScreen from '../screens/auth/EnterEmailScreen';
import VerifyEmailScreen from '../screens/auth/VerifyEmailScreen';
import CreateAccountScreen from '../screens/auth/CreateAccountScreen';
import ConfirmPasswordScreen from '../screens/auth/ConfirmPasswordScreen';
import CongratulationsScreen from '../screens/auth/CongratulationsScreen';

const Stack = createStackNavigator<AuthStackParamList>();

// Custom transition configuration with precise easing and timing
const customTransitionConfig = {
  animation: 'timing' as const,
  config: {
    duration: 300,
    easing: Easing.bezier(0.2, 0, 0.2, 1), // Material standard easing
    useNativeDriver: true,
  },
};

// Custom fade transition for all auth flow screens
const fadeTransition = {
  cardStyleInterpolator: ({ current }: StackCardInterpolationProps): StackCardInterpolatedStyle => ({
    cardStyle: {
      opacity: current.progress,
    },
  }),
  transitionSpec: {
    open: {
      animation: 'timing' as const,
      config: {
        duration: 350,
        easing: Easing.out(Easing.poly(3)),
      },
    },
    close: {
      animation: 'timing' as const,
      config: {
        duration: 300,
        easing: Easing.out(Easing.poly(3)),
      },
    },
  },
  gestureEnabled: false,
};

// Function to clear all signup data
const clearAllSignupData = async () => {
  try {
    // Clear all form data from signup flow
    await AsyncStorage.removeItem('signup_email');
    await AsyncStorage.removeItem('signup_firstName');
    await AsyncStorage.removeItem('signup_lastName');
    await AsyncStorage.removeItem('signup_fullName');
    await AsyncStorage.removeItem('signup_password');
    await AsyncStorage.removeItem('signup_confirmPassword');
    await AsyncStorage.removeItem('signup_session_id');
    await AsyncStorage.removeItem('auth_last_screen');
    
    // Clear verification codes for all emails
    const allKeys = await AsyncStorage.getAllKeys();
    const verificationCodeKeys = allKeys.filter(key => key.startsWith('verification_code_'));
    if (verificationCodeKeys.length > 0) {
      await AsyncStorage.multiRemove(verificationCodeKeys);
    }
    
    console.log('All signup data cleared');
  } catch (error) {
    console.error('Error clearing signup data:', error);
  }
};

export const AuthNavigator = () => {
  // We no longer clear signup data when app is backgrounded or closed
  // This preserves the signup session when users minimize the app
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      // Commented out to preserve data when app is minimized
      // if (nextAppState === 'background' || nextAppState === 'inactive') {
      //   clearAllSignupData();
      // }
      
      // We could add different conditions for clearing data here if needed
      // For example, if app is closed for more than X hours
    };
    
    // Keep the listener for potential future use, but it won't clear data now
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Clean up subscription
      subscription.remove();
    };
  }, []);

  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      detachInactiveScreens={false}
      screenOptions={{
        ...stackScreenOptions,
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' }, // Make background transparent to avoid flash
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        transitionSpec: {
          open: customTransitionConfig,
          close: customTransitionConfig,
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding1" component={Onboarding1Screen} />
      <Stack.Screen name="Onboarding2" component={Onboarding2Screen} />
      <Stack.Screen name="Onboarding3" component={Onboarding3Screen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
      
      {/* New signup flow screens */}
      <Stack.Screen 
        name="EnterEmail" 
        component={EnterEmailScreen} 
      />
      <Stack.Screen 
        name="CreateAccount" 
        component={CreateAccountScreen} 
        options={fadeTransition}
      />
      <Stack.Screen 
        name="VerifyEmail" 
        component={VerifyEmailScreen} 
        options={fadeTransition}
      />
      <Stack.Screen 
        name="ConfirmPassword" 
        component={ConfirmPasswordScreen} 
        options={fadeTransition}
      />
      <Stack.Screen 
        name="Congratulations" 
        component={CongratulationsScreen} 
        options={fadeTransition}
      />
    </Stack.Navigator>
  );
}; 
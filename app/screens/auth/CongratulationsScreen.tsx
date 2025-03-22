import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CongratulationsScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Congratulations'>;
type CongratulationsScreenRouteProp = RouteProp<AuthStackParamList, 'Congratulations'>;

export default function CongratulationsScreen() {
  const navigation = useNavigation<CongratulationsScreenNavigationProp>();
  const route = useRoute<CongratulationsScreenRouteProp>();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Start invisible
  
  const { email } = route.params;

  // Fade in when the screen mounts
  useEffect(() => {
    // Short timeout to ensure screen is fully mounted before animation
    const timer = setTimeout(() => {
      // Start completely invisible (redundant but ensures consistency)
      fadeAnim.setValue(0);
      
      // Use a premium fade-in animation with proper easing
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400, // Slightly longer for this screen for a more celebratory effect
        useNativeDriver: true,
        easing: Platform.OS === 'ios' ? 
          Easing.bezier(0.25, 0.1, 0.25, 1) : 
          Easing.out(Easing.cubic),
      }).start();
    }, 100);
    
    // Mark that we're on this screen
    AsyncStorage.setItem('auth_last_screen', 'Congratulations');
    
    // Clear all form data since registration is complete
    clearAllFormData();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Clear all saved form data since registration is complete
  const clearAllFormData = async () => {
    try {
      // Clear all form data from signup flow
      await AsyncStorage.removeItem('signup_email');
      await AsyncStorage.removeItem('signup_firstName');
      await AsyncStorage.removeItem('signup_lastName');
      await AsyncStorage.removeItem('signup_fullName');
      await AsyncStorage.removeItem('signup_password');
      await AsyncStorage.removeItem('signup_confirmPassword');
      await AsyncStorage.removeItem('signup_session_id'); // Most important - marks session as ended
      await AsyncStorage.removeItem(`verification_code_${email}`);
      
      console.log('All signup form data cleared');
    } catch (error) {
      console.error('Error clearing form data:', error);
    }
  };

  // Attempt to auto-login when this screen loads
  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    try {
      // Retrieve stored password from secure storage
      const storedPassword = await AsyncStorage.getItem('temp_password');
      
      if (email && storedPassword) {
        console.log('Attempting auto-login with stored credentials');
        const { error } = await signIn(email, storedPassword);
        
        if (error) {
          console.error('Auto-login error:', error);
          // If auto-login fails, we'll let user tap the button manually
        } else {
          console.log('Auto-login successful');
          // Navigate to main app using CommonActions
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            })
          );
        }
      } else {
        console.log('Missing credentials for auto-login');
      }
    } catch (error) {
      console.error('Error during auto-login:', error);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    
    try {
      // Premium smooth fade out with better easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250, // Slightly longer for premium feel
        useNativeDriver: true,
        easing: Platform.OS === 'ios' ? 
          Easing.bezier(0.25, 0.1, 0.25, 1) : 
          Easing.out(Easing.cubic),
      }).start(async () => {
        // Retrieve stored password from secure storage
        const storedPassword = await AsyncStorage.getItem('temp_password');
        
        if (email && storedPassword) {
          const { error } = await signIn(email, storedPassword);
          
          if (error) {
            Alert.alert('Login Error', 'Failed to log in automatically. Please sign in manually.');
            // Navigate to login if manual sign-in is needed
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } else {
            // Navigate to main app using CommonActions
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
          }
        } else {
          // If no credentials, go to login
          Alert.alert('Login Required', 'Please sign in with your new account.');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
        
        // We won't reset opacity until later - prevents flickering
        setTimeout(() => {
          fadeAnim.setValue(1);
          setLoading(false);
          
          // Clean up stored credentials
          AsyncStorage.removeItem('temp_password');
        }, 750);
      });
    } catch (error) {
      console.error('Error during manual login:', error);
    navigation.reset({
      index: 0,
        routes: [{ name: 'Login' }],
      });
      
      fadeAnim.setValue(1);
      setLoading(false);
      
      // Clean up stored credentials
      AsyncStorage.removeItem('temp_password');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={80} color={colors.white} />
        </View>
        
        <Text style={styles.title}>Welcome to Expense Splitter!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully. You're all set to start tracking and splitting expenses with friends.
        </Text>
        
        <Text style={styles.emailInfo}>
          Signed in as <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="people-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Create Circles</Text>
              <Text style={styles.featureDescription}>Organize expenses in circles with friends, family, or roommates</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="calculator-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Split Expenses</Text>
              <Text style={styles.featureDescription}>Easily track who owes what and settle up with minimal fuss</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="analytics-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Track Spending</Text>
              <Text style={styles.featureDescription}>See your spending history and patterns at a glance</Text>
            </View>
          </View>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <Button
          onPress={handleContinue}
          fullWidth
          variant="primary"
          style={styles.continueButton}
          loading={loading}
        >
          Get Started
        </Button>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emailInfo: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  features: {
    width: '100%',
    marginTop: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  continueButton: {
    height: 56,
  },
}); 
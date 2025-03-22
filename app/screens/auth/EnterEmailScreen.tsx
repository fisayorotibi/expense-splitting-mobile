import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Alert,
  Keyboard,
  Animated,
  Easing
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { markUserHasAccount } from '../../utils/accountUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type EnterEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'EnterEmail'>;
type EnterEmailScreenRouteProp = RouteProp<AuthStackParamList, 'EnterEmail'>;

// Generate a unique session ID for this signup attempt
const generateSessionId = () => {
  return Date.now().toString();
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

export default function EnterEmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(1))[0]; 
  const emailInputRef = useRef<TextInput>(null);
  
  const navigation = useNavigation<EnterEmailScreenNavigationProp>();
  const { signUp, resendCode } = useAuth();

  // Clear all form data when this screen first loads (new session)
  useEffect(() => {
    // Generate and save a new session ID
    const startNewSession = async () => {
      await clearAllSignupData();
      const sessionId = generateSessionId();
      await AsyncStorage.setItem('signup_session_id', sessionId);
      console.log('New signup session started with ID:', sessionId);
    };
    
    startNewSession();
  }, []);

  // Fade in when the screen mounts
  useEffect(() => {
    // Start completely invisible
    fadeAnim.setValue(0);
    
    // Use a premium fade-in animation with proper easing
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Platform.OS === 'ios' ? 
        Easing.bezier(0.25, 0.1, 0.25, 1) : 
        Easing.out(Easing.cubic),
    }).start();
    
    // Load saved email if exists
    loadSavedEmail();
  }, []);
  
  // Smart focus: Only focus input when empty or there's an error
  useEffect(() => {
    // Skip auto-focus logic if keyboard is visible (user is likely typing)
    const keyboardVisible = Keyboard.isVisible ? Keyboard.isVisible() : false;
    
    // Only run focus logic if keyboard is not visible or there's an error
    if (!keyboardVisible || errorMessage) {
      const timer = setTimeout(() => {
        if (!email || errorMessage) {
          emailInputRef.current?.focus();
        } else if (!isFocused && !keyboardVisible) {
          // Only dismiss keyboard if we're not focused and keyboard isn't visible
          // This prevents dismissing while typing
          Keyboard.dismiss();
        }
      }, 400); // Delay to allow animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [email, errorMessage]);
  
  // Track focus state with a local variable
  const [isFocused, setIsFocused] = useState(false);
  
  // Save email whenever it changes
  useEffect(() => {
    if (email) {
      AsyncStorage.setItem('signup_email', email);
    }
  }, [email]);
  
  const loadSavedEmail = async () => {
    try {
      // Check if we have a valid session ID
      const sessionId = await AsyncStorage.getItem('signup_session_id');
      if (!sessionId) {
        // No session ID, don't load data
        return;
      }
      
      const savedEmail = await AsyncStorage.getItem('signup_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (error) {
      console.error('Error loading saved email:', error);
    }
  };

  const validateEmail = () => {
    if (!email) {
      setErrorMessage('Email is required');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleContinue = async () => {
    if (!validateEmail()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Dismiss keyboard first
      Keyboard.dismiss();
      
      // Premium smooth fade out with better easing
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250, // Slightly longer for premium feel
        useNativeDriver: true,
        easing: Platform.OS === 'ios' ? 
          Easing.bezier(0.25, 0.1, 0.25, 1) : 
          Easing.out(Easing.cubic),
      }).start(async () => {
        // Mark that we're on this screen
        await AsyncStorage.setItem('auth_last_screen', 'EnterEmail');
        
        // Navigate to CreateAccount screen
        navigation.navigate('CreateAccount', { email });
        
        // We won't reset opacity until later - prevents flickering
        setTimeout(() => {
          fadeAnim.setValue(1);
          setLoading(false);
        }, 750); // Longer timeout to ensure the next screen is fully visible
      });
    } catch (error) {
      console.error('Error in handleContinue:', error);
      setErrorMessage('An unexpected error occurred');
      fadeAnim.setValue(1);
      setLoading(false);
    }
  };

  const handleBack = () => {
    // Clear all signup data when exiting flow
    clearAllSignupData();
    navigation.goBack();
  };

  // Function to dismiss keyboard when necessary
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBack}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Enter your email</Text>
            <Text style={styles.subtitle}>We'll send you a code to verify your email</Text>
            
            <View style={styles.formContainer}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <TextInput
                  ref={emailInputRef}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>

            <View style={styles.bottomContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
              
              <Button
                onPress={() => {
                  dismissKeyboard();
                  handleContinue();
                }}
                loading={loading}
                fullWidth
                variant="primary"
                style={styles.continueButton}
              >
                Continue
              </Button>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  backButton: {
    marginBottom: spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: colors.dangerLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.danger,
    fontSize: fontSizes.sm,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
    backgroundColor: colors.background.secondary,
  },
  continueButton: {
    marginTop: spacing.md,
  },
  bottomContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  termsText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
}); 
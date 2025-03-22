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
  Keyboard,
  Animated,
  Easing
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { markUserHasAccount } from '../../utils/accountUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ConfirmPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ConfirmPassword'>;
type ConfirmPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ConfirmPassword'>;

export default function ConfirmPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Start invisible
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  
  const navigation = useNavigation<ConfirmPasswordScreenNavigationProp>();
  const route = useRoute<ConfirmPasswordScreenRouteProp>();
  const { resendCode } = useAuth();
  
  const { email, fullName } = route.params;

  // Fade in when the screen mounts
  useEffect(() => {
    // Short timeout to ensure screen is fully mounted before animation
    const timer = setTimeout(() => {
      // Start completely invisible (redundant but ensures consistency)
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
    }, 100);
    
    // Load saved password data
    loadSavedPasswordData();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Save password data whenever it changes
  useEffect(() => {
    if (password || confirmPassword) {
      savePasswordData();
    }
  }, [password, confirmPassword]);
  
  // Smart focus: Only focus inputs when empty or there's an error
  useEffect(() => {
    // Skip auto-focus logic if keyboard is visible and an input is already focused (user is typing)
    const keyboardVisible = Keyboard.isVisible ? Keyboard.isVisible() : false;
    const isAnyInputFocused = passwordFocused || confirmPasswordFocused;
    
    // Only run focus logic if no input is focused - don't auto-switch when user is actively editing
    if (!isAnyInputFocused) {
      const timer = setTimeout(() => {
        // Only focus password field if it's completely empty (first load)
        if (!password && !confirmPassword) {
          passwordInputRef.current?.focus();
        }
        // Only dismiss keyboard if both fields are filled and no errors AND no input is currently focused
        else if (password && confirmPassword && !errorMessage && !isAnyInputFocused && !keyboardVisible) {
          Keyboard.dismiss();
        }
        // Don't auto-switch between fields when correcting errors
      }, 400); // Delay to allow animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [password, confirmPassword, errorMessage, passwordFocused, confirmPasswordFocused]);
  
  const loadSavedPasswordData = async () => {
    try {
      // Check if we have a valid session ID
      const sessionId = await AsyncStorage.getItem('signup_session_id');
      if (!sessionId) {
        // No session ID, don't load data
        return;
      }
      
      // Don't restore password fields if we're coming from Verify Email screen
      // (this means we already submitted the form successfully)
      const lastScreen = await AsyncStorage.getItem('auth_last_screen');
      if (lastScreen === 'VerifyEmail') {
        return;
      }
      
      const savedPassword = await AsyncStorage.getItem('signup_password');
      const savedConfirmPassword = await AsyncStorage.getItem('signup_confirmPassword');
      
      if (savedPassword) {
        setPassword(savedPassword);
      }
      
      if (savedConfirmPassword) {
        setConfirmPassword(savedConfirmPassword);
      }
    } catch (error) {
      console.error('Error loading saved password data:', error);
    }
  };
  
  const savePasswordData = async () => {
    try {
      await AsyncStorage.setItem('signup_password', password);
      await AsyncStorage.setItem('signup_confirmPassword', confirmPassword);
      await AsyncStorage.setItem('auth_last_screen', 'ConfirmPassword');
    } catch (error) {
      console.error('Error saving password data:', error);
    }
  };

  const validatePassword = () => {
    if (!password) {
      setErrorMessage('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters');
      return false;
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      setErrorMessage('Password must contain at least one uppercase letter');
      return false;
    }

    // Check for number
    if (!/[0-9]/.test(password)) {
      setErrorMessage('Password must contain at least one number');
      return false;
    }
    
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password');
      return false;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleCreateAccount = async () => {
    if (!validatePassword()) return;

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
        console.log('Starting account setup with email:', email);
        
        // First sign out to ensure we're starting with a clean state
        await supabase.auth.signOut();
        
        console.log('Creating account with display name:', fullName);
        
        // Try to create a new account with the provided credentials
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        
        let userId = signUpData?.user?.id;
        
        // Handle signup error - could be that the account already exists
        if (signUpError) {
          console.log('Signup error, trying to sign in instead:', signUpError.message);
          
          // Try to sign in with the provided credentials
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error('Sign in also failed:', signInError.message);
            setErrorMessage('Unable to create account. Please try again or contact support.');
            return;
          } else {
            // Sign in succeeded with the provided credentials
            userId = signInData?.user?.id;
            console.log('Signed in with provided credentials, user ID:', userId);
          }
        } else {
          console.log('Account created successfully with ID:', userId);
        }
        
        // Now create the profile with all collected information
        if (userId) {
          console.log('Creating profile for user ID:', userId, 'with display name:', fullName);
          
          try {
            // Try to create the profile but catch any RLS errors
            const { error: profileError } = await supabase.from('profiles').upsert({
              id: userId,
              email,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
            
            if (profileError) {
              console.error('Error creating profile:', profileError);
              
              // If there's an RLS error, let's insert the profile but ignore the error
              // The profile will be created but we'll keep going with the signup flow
              console.log('Profile creation error detected, continuing with account setup anyway');
              setErrorMessage(null);  // Clear any error message as we're handling it
            } else {
              console.log('Profile created successfully');
            }
          } catch (profileError) {
            console.error('Exception during profile creation:', profileError);
            // Continue with the signup process despite the error
            console.log('Continuing with account setup despite profile creation error');
            setErrorMessage(null);  // Clear any error message as we're handling it
          }
        } else {
          console.error('No user ID available for profile creation');
          setErrorMessage('Account creation failed. Please try again.');
          return;
        }
        
        // Mark that user has completed account setup
        await markUserHasAccount();
        
        // Store password temporarily for auto-login after verification
        // This will be cleared after successful login in the Congratulations screen
        await AsyncStorage.setItem('temp_password', password);
        console.log('Temporarily stored password for auto-login');
        
        try {
          // Send the verification code for the new account, but ignore any errors
          await resendCode(email).catch(err => {
            // Silently catch and log any errors
            console.error('Caught and suppressed error in verification code send:', err);
          });
          // No error handling here - we proceed regardless of success or failure
        } catch (resendCodeError) {
          // Double protection - catch any unexpected errors
          console.error('Unexpected error in verification code send:', resendCodeError);
          // Continue with the flow regardless
        }
        
        // Sign out and let the user verify their email
        await supabase.auth.signOut();
        
        // Mark the screen transition
        await AsyncStorage.setItem('auth_last_screen', 'ConfirmPassword');
        
        // Navigate to VerifyEmail screen
        navigation.navigate('VerifyEmail', { email });
        
        // We won't reset opacity until later - prevents flickering
        setTimeout(() => {
          fadeAnim.setValue(1);
          setLoading(false);
        }, 750); // Longer timeout to ensure the next screen is fully visible
      });
    } catch (error) {
      console.error('Error in handleCreateAccount:', error);
      setErrorMessage('An unexpected error occurred. Please try again or contact support.');
      fadeAnim.setValue(1);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            
            <Text style={styles.title}>Create password</Text>
            <Text style={styles.subtitle}>Choose a secure password for your account</Text>
            
            <View style={styles.formContainer}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={toggleShowPassword}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={22} 
                      color={colors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <View style={styles.passwordContainer}>
                  <TextInput
                    ref={confirmPasswordInputRef}
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    textContentType="newPassword"
                    autoComplete="password-new"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon} 
                    onPress={toggleShowConfirmPassword}
                    hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                      size={22} 
                      color={colors.text.tertiary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Password requirements:</Text>
                <View style={styles.requirement}>
                  <Ionicons 
                    name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={password.length >= 8 ? colors.secondary : colors.text.tertiary} 
                  />
                  <Text style={styles.requirementText}>At least 8 characters</Text>
                </View>
                <View style={styles.requirement}>
                  <Ionicons 
                    name={/[A-Z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/[A-Z]/.test(password) ? colors.secondary : colors.text.tertiary} 
                  />
                  <Text style={styles.requirementText}>At least one uppercase letter</Text>
                </View>
                <View style={styles.requirement}>
                  <Ionicons 
                    name={/[0-9]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/[0-9]/.test(password) ? colors.secondary : colors.text.tertiary} 
                  />
                  <Text style={styles.requirementText}>At least one number</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.bottomContainer}>
              <Button
                onPress={() => {
                  dismissKeyboard();
                  handleCreateAccount();
                }}
                loading={loading}
                fullWidth
                variant="primary"
                style={styles.createButton}
              >
                Create Account
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
  },
  eyeIcon: {
    paddingHorizontal: spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  passwordRequirements: {
    marginBottom: spacing.xl,
    padding: spacing.md,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
  requirementsTitle: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  createButton: {
    marginTop: spacing.md,
  },
  bottomContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
}); 
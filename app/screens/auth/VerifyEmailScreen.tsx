import React, { useState, useRef, useEffect } from 'react';
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
  Clipboard,
  Animated,
  Easing
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type VerifyEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [showPasteButton, setShowPasteButton] = useState(false);
  const [longPressPosition, setLongPressPosition] = useState({ x: 0, y: 0 });
  const [resendTimer, setResendTimer] = useState(0);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Start invisible
  const initialLoadRef = useRef(true);
  const codeInputRef = useRef<TextInput>(null);
  
  const navigation = useNavigation<VerifyEmailScreenNavigationProp>();
  const route = useRoute<VerifyEmailScreenRouteProp>();
  const { resendCode, verifySignUpCode } = useAuth();
  
  const { email } = route.params;
  
  useEffect(() => {
    // Auto-send the verification code when the screen loads - but only once
    if (initialLoadRef.current) {
      // Don't trigger an alert for the initial code send
      handleSendCode(false);
      initialLoadRef.current = false;
    }
    
    // Always allow resending
    setCanResend(true);
  }, []);

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
    
    // Load saved verification code
    loadSavedVerificationCode();
    
    // Mark that we're on this screen
    AsyncStorage.setItem('auth_last_screen', 'VerifyEmail');
    
    return () => clearTimeout(timer);
  }, []);
  
  // Save verification code whenever it changes
  useEffect(() => {
    if (verificationCode) {
      saveVerificationCode();
    }
  }, [verificationCode]);
  
  // Smart focus: Only focus code input when empty or there's an error
  useEffect(() => {
    // Skip auto-focus logic if keyboard is visible and input is already focused (user is typing)
    const keyboardVisible = Keyboard.isVisible ? Keyboard.isVisible() : false;
    
    // Only auto-focus on initial load or when there's an error
    // We use a ref to track if we've already applied initial focus
    if (initialLoadRef.current || errorMessage) {
      const timer = setTimeout(() => {
        if (initialLoadRef.current && !verificationCode) {
          // Only auto-focus on first load when code is empty
          codeInputRef.current?.focus();
          setIsFocused(true);
          initialLoadRef.current = false;
        } else if (errorMessage && !isFocused) {
          // Only focus on error if not already focused
          codeInputRef.current?.focus();
          setIsFocused(true);
        }
      }, 400); // Delay for animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [verificationCode, errorMessage, isFocused]);
  
  const loadSavedVerificationCode = async () => {
    try {
      // Check if we have a valid session ID
      const sessionId = await AsyncStorage.getItem('signup_session_id');
      if (!sessionId) {
        // No session ID, don't load data
        return;
      }
      
      // Don't restore verification code if we're coming from Congratulations screen
      // (this means we already submitted successfully)
      const lastScreen = await AsyncStorage.getItem('auth_last_screen');
      if (lastScreen === 'Congratulations') {
        return;
      }
      
      const savedVerificationCode = await AsyncStorage.getItem(`verification_code_${email}`);
      if (savedVerificationCode) {
        setVerificationCode(savedVerificationCode);
      }
    } catch (error) {
      console.error('Error loading saved verification code:', error);
    }
  };
  
  const saveVerificationCode = async () => {
    try {
      // Store the verification code tied to this email
      await AsyncStorage.setItem(`verification_code_${email}`, verificationCode);
    } catch (error) {
      console.error('Error saving verification code:', error);
    }
  };

  const handleSendCode = async (isResend = false) => {
    if (loading || (isResend && !canResend)) return;
    
    setLoading(true);

    try {
      // Reset resend timer state
      setCanResend(false);
      setResendTimer(60);

      // Try to send verification code
      await resendCode(email).catch(err => {
        // Silently log and suppress errors
        console.error('Suppressed error in verification code send:', err);
      });
      
      // Start resend timer regardless of success or failure
      startResendTimer();
      
      // Never show errors to the user - just show a success message
      if (isResend) {
        // Always show success message even if it might have failed
        setErrorMessage(null);
        // Placeholder for future success message if needed
      }
    } catch (error) {
      // Suppress all errors, just log them
      console.error('Unexpected error in handleSendCode:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateVerificationCode = () => {
    if (!verificationCode) {
      setErrorMessage('Please enter the verification code');
      return false;
    }

    if (verificationCode.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code');
      return false;
    }

    return true;
  };

  const handleVerify = async () => {
    if (!validateVerificationCode()) return;

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
        // Verify the code but don't create any profile yet
        const { error, success } = await verifySignUpCode(email, verificationCode);
  
        if (error) {
          setErrorMessage(error.message);
          // Reset opacity if there's an error
          fadeAnim.setValue(1);
          setLoading(false);
          return;
        }
  
        // Successful verification - immediately navigate to Congratulations screen
        console.log('Email verified successfully, moving to Congratulations screen');
        
        // Mark the screen transition
        await AsyncStorage.setItem('auth_last_screen', 'VerifyEmail');
        
        // Navigate to Congratulations screen
        navigation.navigate('Congratulations', { email });
        
        // We won't reset opacity until later - prevents flickering
        setTimeout(() => {
          fadeAnim.setValue(1);
          setLoading(false);
        }, 750); // Longer timeout to ensure the next screen is fully visible
      });
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('An error occurred. Please try again.');
      fadeAnim.setValue(1);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const formattedText = text.replace(/[^0-9]/g, '');
    
    // Limit to 6 digits
    if (formattedText.length <= 6) {
      setVerificationCode(formattedText);
    }
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    const codeArray = verificationCode.split('');
    
    for (let i = 0; i < 6; i++) {
      boxes.push(
        <TouchableOpacity 
          key={i} 
          style={[
            styles.codeBox,
            isFocused && i === codeArray.length && styles.codeBoxActive,
            codeArray[i] ? styles.codeBoxFilled : null
          ]}
          onPress={() => {
            codeInputRef.current?.focus();
            setShowPasteButton(false);
          }}
          onLongPress={(event) => {
            // Show custom paste button
            const { nativeEvent } = event;
            setLongPressPosition({ 
              x: nativeEvent.locationX, 
              y: nativeEvent.locationY 
            });
            setShowPasteButton(true);
          }}
          activeOpacity={0.8}
          delayLongPress={300}
        >
          <Text style={styles.codeText}>{codeArray[i] || ''}</Text>
        </TouchableOpacity>
      );
    }
    
    return boxes;
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        // Extract only numbers and take the first 6 digits
        const code = text.replace(/[^0-9]/g, '').substring(0, 6);
        if (code) {
          setVerificationCode(code);
        }
      }
    } catch (error) {
      console.error('Failed to paste from clipboard:', error);
    } finally {
      setShowPasteButton(false);
    }
  };

  // Function to dismiss keyboard when necessary
  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setShowPasteButton(false);
  };

  const startResendTimer = () => {
    let secondsLeft = 60;
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setResendTimer(secondsLeft);
      
      if (secondsLeft <= 0) {
        clearInterval(interval);
        setCanResend(true);
      }
    }, 1000);
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
            
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to{' '}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
            
            <View style={styles.formContainer}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <View style={styles.codeInputContainer}>
                  {renderCodeBoxes()}
                  
                  <TextInput
                    ref={codeInputRef}
                    style={styles.hiddenInput}
                    value={verificationCode}
                    onChangeText={handleCodeChange}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="sms-otp"
                    textContentType="oneTimeCode"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    contextMenuHidden={true}
                    caretHidden={true}
                    selectTextOnFocus={true}
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                onPress={() => !loading && handleSendCode(true)}
                style={styles.resendButton}
                disabled={loading || !canResend}
              >
                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn't receive the code?{' '}
                  </Text>
                  <Text style={[
                    styles.resendLink,
                    (!canResend || loading) && styles.resendTextDisabled
                  ]}>
                    Resend
                  </Text>
                </View>
              </TouchableOpacity>
              
              {showPasteButton && (
                <TouchableOpacity
                  style={[
                    styles.pasteButton,
                    {
                      position: 'absolute',
                      top: longPressPosition.y - 52,
                      left: '50%', // Center on x-axis of the screen
                      transform: [{ translateX: -28 }], // Adjust for button width
                      zIndex: 1000,
                    }
                  ]}
                  onPress={handlePaste}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pasteButtonText}>Paste</Text>
                  <View style={styles.tooltipArrow} />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.bottomContainer}>
              <Button
                onPress={() => {
                  dismissKeyboard();
                  handleVerify();
                }}
                loading={loading}
                fullWidth
                variant="primary"
                style={styles.verifyButton}
              >
                Verify
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
  emailText: {
    fontWeight: '600',
    color: colors.text.primary,
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
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: colors.text.primary,
  },
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    position: 'relative',
  },
  codeBox: {
    width: 45,
    height: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxActive: {
    borderColor: colors.border.default,
    borderWidth: 1,
  },
  codeBoxFilled: {
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  codeText: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    color: colors.text.primary,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.01,
  },
  verifyButton: {
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  resendText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  resendLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  resendButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 0,
  },
  tooltipArrow: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderLeftColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: 'transparent',
    borderTopWidth: 8,
    borderTopColor: colors.background.secondary,
  },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pasteButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pasteButtonText: {
    color: colors.primary,
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  bottomContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
}); 
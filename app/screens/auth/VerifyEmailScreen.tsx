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
  Keyboard
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

type VerifyEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type VerifyEmailScreenRouteProp = RouteProp<AuthStackParamList, 'VerifyEmail'>;

export default function VerifyEmailScreen() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
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
    
    // Set up the countdown timer
    let interval: NodeJS.Timeout | null = null;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setCanResend(true);
            if (interval) clearInterval(interval);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleSendCode = async (showAlert = true) => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      // Use the actual resendCode function from useAuth to send the verification code
      const { error } = await resendCode(email);
      
      if (error) {
        setErrorMessage(error.message || 'Failed to send verification code');
        return;
      }
      
      // Restart the timer
      setTimer(60);
      setCanResend(false);
      
      // Show confirmation to the user (only if not the initial send)
      if (showAlert) {
        Alert.alert(
          "Verification Code Sent",
          `We've sent a verification code to ${email}. Please check your inbox and enter the code below.`
        );
      }
    } catch (error) {
      setErrorMessage('Failed to send verification code. Please try again.');
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
      // Verify the code but don't create any profile yet
      const { error, success } = await verifySignUpCode(email, verificationCode);

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }

      // Successful verification - immediately navigate to Congratulations screen
      console.log('Email verified successfully, moving to Congratulations screen');
      
      // Add a small delay to ensure any auth state changes are processed
      setTimeout(() => {
        // Navigate to Congratulations screen
        navigation.navigate('Congratulations', { email });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error verifying code:', error);
      setErrorMessage('An error occurred. Please try again.');
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
          onPress={() => codeInputRef.current?.focus()}
          activeOpacity={0.8}
        >
          <Text style={styles.codeText}>{codeArray[i] || ''}</Text>
        </TouchableOpacity>
      );
    }
    
    return boxes;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>We've sent a verification code to {email}</Text>
          
          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification code</Text>
              
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
                  autoFocus
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </View>
            </View>
            
            <Button
              onPress={handleVerify}
              loading={loading}
              fullWidth
              variant="primary"
              style={styles.verifyButton}
            >
              Verify and Continue
            </Button>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive a code?</Text>
              {canResend ? (
                <TouchableOpacity 
                  onPress={() => handleSendCode(true)} 
                  disabled={loading}
                >
                  <Text style={styles.resendLink}>Send again</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>Resend in {timer}s</Text>
              )}
            </View>
          </View>
        </ScrollView>
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
    borderColor: colors.primary,
    borderWidth: 2,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background.tertiary,
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
    opacity: 0,
  },
  verifyButton: {
    marginBottom: spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  resendText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    marginRight: spacing.xs,
  },
  resendLink: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  timerText: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
}); 
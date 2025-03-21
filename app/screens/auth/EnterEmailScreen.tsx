import React, { useState } from 'react';
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
  Alert
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

type EnterEmailScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'EnterEmail'>;
type EnterEmailScreenRouteProp = RouteProp<AuthStackParamList, 'EnterEmail'>;

export default function EnterEmailScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigation = useNavigation<EnterEmailScreenNavigationProp>();
  const { signUp, resendCode } = useAuth();

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
      // First check if the email exists in Supabase
      console.log('Checking if email exists:', email);
      
      // Try to reset password for the email - this is a reliable way to check if email exists
      // without revealing too much information (doesn't actually send an email)
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: undefined // Disable automatic email
      });
      
      // If no error or rate limit error, the email likely exists
      // Rate limit errors still suggest the email exists but we're hitting limits
      const emailExists = !resetError || 
                          (resetError.message && 
                           (resetError.message.includes('rate limit') || 
                            resetError.message.includes('try again')));
      
      // Navigate to verify email screen
      navigation.navigate('VerifyEmail', { email });
      
      if (emailExists) {
        console.log('Email exists, sending verification code');
        // Send the verification code
        await resendCode(email);
        await markUserHasAccount();
        setLoading(false);
        return;
      }

      // If we get here, email doesn't exist - create a new account
      console.log('Email not found, creating new account');
      
      // Create a temporary password - user will set their real password later
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}${Math.random().toString(10).slice(-2)}!`;
      
      // Create the temporary user account
      console.log('Creating temporary account for email:', email);
      const { error: signUpError, userId } = await signUp(email, tempPassword, '');
      
      if (signUpError) {
        // If signup still fails, the email might actually exist (race condition or our check failed)
        if (signUpError.message?.includes('already registered')) {
          console.log('Email already registered (from signup response), sending verification code');
          await resendCode(email);
          await markUserHasAccount();
          return;
        }
        
        console.error('Error creating temporary account:', signUpError.message);
        return;
      }
      
      // New account was created successfully
      console.log('Created temporary account for:', email, 'User ID:', userId);
      await markUserHasAccount();
      
      // Send the verification code for the new account
      const { error: resendError } = await resendCode(email);
      
      if (resendError) {
        console.error('Error sending verification code:', resendError.message);
      }
    } catch (error) {
      console.error('Error in handleContinue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
          
          <Text style={styles.title}>Enter your email</Text>
          <Text style={styles.subtitle}>We'll send you a code to verify your email</Text>
          
          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoFocus
              />
            </View>
            
            <Button
              onPress={handleContinue}
              loading={loading}
              fullWidth
              variant="primary"
              style={styles.continueButton}
            >
              Continue
            </Button>
            
            <Text style={styles.termsText}>
              By continuing, you agree to our <Text style={styles.termsLink}>Terms of Service</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
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
    marginBottom: spacing.lg,
  },
  termsText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: '500',
  },
}); 
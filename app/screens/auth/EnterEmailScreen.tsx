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
      // First navigate to verify email screen - don't wait for API calls to complete
      navigation.navigate('VerifyEmail', { email });
      
      // Check if email exists in Supabase
      try {
        // First approach: Try to sign in with an invalid password
        // If we get an "Invalid login credentials" error, we know the email exists
        // If we get a different error, the email might not exist
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: 'check_if_account_exists_123456'
        });

        if (signInError) {
          // The email exists if the error contains "Invalid login credentials"
          if (signInError.message.includes('Invalid login credentials')) {
            console.log('Email exists in Supabase (password check), sending verification code');
            await resendCode(email);
            await markUserHasAccount();
            setLoading(false);
            return;
          }
        } else {
          // If no error, somehow the password worked (extremely unlikely)
          // Email definitely exists
          console.log('Email exists in Supabase (unexpected successful login), sending verification code');
          await supabase.auth.signOut(); // Sign out immediately
          await resendCode(email);
          await markUserHasAccount();
          setLoading(false);
          return;
        }
        
        // Second approach: Try to reset password for this email
        // This will typically succeed even if the email doesn't exist in Supabase
        // But we can check for specific errors
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: undefined
        });
        
        if (resetError) {
          if (!resetError.message.includes('For security purposes')) {
            // If we get an error that's not the generic security message,
            // the email might not exist
            console.log('Password reset error suggests email may not exist:', resetError.message);
          } else {
            // This is the typical response, doesn't tell us much
            console.log('Password reset response inconclusive');
          }
        } else {
          // Successfully sent reset email - this could indicate the email exists
          console.log('Successfully sent password reset - email might exist');
        }
        
      } catch (checkError) {
        console.log('Email existence check error:', checkError);
        // Continue with signup attempt if check fails
      }
      
      // If we get here, we're not sure if the email exists - try creating a temporary account
      // Create a temporary password - user will set their real password later
      const tempPassword = `Temp${Math.random().toString(36).slice(-8)}${Math.random().toString(10).slice(-2)}!`;
      
      // Create the temporary user account
      console.log('Attempting to create temporary account for email:', email);
      const { error, userId } = await signUp(email, tempPassword, '');
      
      if (error) {
        // Handle different error cases
        if (error.message?.includes('already registered')) {
          console.log('Email already registered (from signup response), sending verification code');
          await resendCode(email);
          await markUserHasAccount();
          return;
        }
        
        // If we get here, there was an unexpected error
        console.error('Error creating temporary account:', error.message);
        return;
      }
      
      // New account was created successfully
      console.log('Created temporary account with ID:', userId);
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
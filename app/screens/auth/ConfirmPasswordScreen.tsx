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
  StatusBar
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

type ConfirmPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'ConfirmPassword'>;
type ConfirmPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'ConfirmPassword'>;

export default function ConfirmPasswordScreen() {
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigation = useNavigation<ConfirmPasswordScreenNavigationProp>();
  const route = useRoute<ConfirmPasswordScreenRouteProp>();
  
  const { email, fullName, password } = route.params;

  const validatePassword = () => {
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
      console.log('Starting final account creation process with email:', email);
      
      // First sign out to ensure we're starting with a clean state
      await supabase.auth.signOut();
      
      // Try to login with provided email/password in case the account already exists
      // from a previous verification process
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      let userId = signInData?.user?.id;
      
      // If login fails, we need to create a new account
      if (signInError) {
        console.log('Login failed, creating new account:', signInError.message);
        
        // Create a new account with the provided credentials
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });
        
        if (signUpError) {
          console.error('Failed to create account:', signUpError);
          setErrorMessage('Account creation failed. Please try again.');
          return;
        }
        
        userId = signUpData?.user?.id;
        console.log('Created new account with ID:', userId);
      } else {
        console.log('Logged in to existing account with ID:', userId);
        
        // Update user metadata with the full name
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: fullName
          }
        });
        
        if (updateError) {
          console.error('Failed to update user metadata:', updateError);
          // Continue anyway - we'll store name in profile
        }
      }
      
      // Now create/update profile
      if (userId) {
        console.log('Creating profile with full name:', fullName);
        
        try {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            email,
            full_name: fullName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
            setErrorMessage('Profile creation failed, but your account was created. You may need to set your display name in settings.');
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileError) {
          console.error('Exception during profile creation:', profileError);
        }
      } else {
        console.error('No user ID available for profile creation');
        setErrorMessage('Account created but profile setup failed. Please contact support.');
      }
      
      // Mark that user has completed account setup
      await markUserHasAccount();
      
      // If we got this far, we've created the account and possibly the profile
      // Sign out and let the user log in fresh
      await supabase.auth.signOut();
      
      // Show success screen
      navigation.navigate('Congratulations', { email });
    } catch (error) {
      console.error('Error in handleCreateAccount:', error);
      setErrorMessage('An unexpected error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          
          <Text style={styles.title}>Confirm password</Text>
          <Text style={styles.subtitle}>Please confirm your password to continue</Text>
          
          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoFocus
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
            
            <Button
              onPress={handleCreateAccount}
              loading={loading}
              fullWidth
              variant="primary"
              style={styles.createButton}
            >
              Create Account
            </Button>
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
  createButton: {
    marginBottom: spacing.lg,
  },
}); 
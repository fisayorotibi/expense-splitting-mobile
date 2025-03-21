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
  const { completeSignUp } = useAuth();

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
      // Use our new completeSignUp function to properly save the password and profile
      const { error, success } = await completeSignUp(email, password, fullName);
      
      if (error) {
        setErrorMessage(error.message || 'Failed to complete account setup');
        return;
      }

      // Mark that user has an account
      await markUserHasAccount();
      
      // Account created successfully, navigate to success screen
      navigation.navigate('Congratulations', { email });
    } catch (error) {
      console.error('Error in handleCreateAccount:', error);
      setErrorMessage('An unexpected error occurred');
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
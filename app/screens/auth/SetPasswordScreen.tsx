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

type SetPasswordScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SetPassword'>;
type SetPasswordScreenRouteProp = RouteProp<AuthStackParamList, 'SetPassword'>;

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigation = useNavigation<SetPasswordScreenNavigationProp>();
  const route = useRoute<SetPasswordScreenRouteProp>();
  
  const { email, fullName } = route.params;

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
    
    return true;
  };

  const handleContinue = () => {
    if (!validatePassword()) return;
    
    // Navigate to confirm password screen with all required information
    navigation.navigate('ConfirmPassword', {
      email,
      fullName, 
      password
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
          
          <Text style={styles.title}>Create password</Text>
          <Text style={styles.subtitle}>Choose a secure password for your account</Text>
          
          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="password-new"
                  autoFocus
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
            
            <Button
              onPress={handleContinue}
              loading={loading}
              fullWidth
              variant="primary"
              style={styles.continueButton}
            >
              Continue
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
  continueButton: {
    marginBottom: spacing.lg,
  },
}); 
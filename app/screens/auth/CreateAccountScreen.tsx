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
import { supabase } from '../../services/supabase';

type CreateAccountScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'CreateAccount'>;
type CreateAccountScreenRouteProp = RouteProp<AuthStackParamList, 'CreateAccount'>;

export default function CreateAccountScreen() {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const route = useRoute<CreateAccountScreenRouteProp>();
  
  const { email } = route.params;

  const validateFullName = () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }
    
    // Very simple validation - just check that name is not too short
    if (fullName.trim().length < 2) {
      setErrorMessage('Name is too short');
      return false;
    }
    
    return true;
  };

  const handleContinue = async () => {
    if (!validateFullName()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Try to update the user metadata with the name, but continue even if it fails
      // This is a best-effort update, as the main update will happen in the SetPassword screen
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          await supabase.auth.updateUser({
            data: { full_name: fullName.trim() }
          });
        }
      } catch (updateError) {
        // Just log the error and continue - this is not critical
        console.error('Could not update user metadata:', updateError);
      }

      // Navigate to password setup
      navigation.navigate('SetPassword', { 
        email,
        fullName: fullName.trim() 
      });
    } catch (error) {
      console.error('Error in handleContinue:', error);
      setErrorMessage('An unexpected error occurred');
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
          
          <Text style={styles.title}>Your profile</Text>
          <Text style={styles.subtitle}>Tell us your name to create your account</Text>
          
          <View style={styles.formContainer}>
            {errorMessage && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your full name"
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
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
}); 
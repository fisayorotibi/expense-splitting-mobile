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
import { supabase } from '../../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CreateAccountScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'CreateAccount'>;
type CreateAccountScreenRouteProp = RouteProp<AuthStackParamList, 'CreateAccount'>;

export default function CreateAccountScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0]; // Start invisible
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  
  const navigation = useNavigation<CreateAccountScreenNavigationProp>();
  const route = useRoute<CreateAccountScreenRouteProp>();
  
  const { email } = route.params;

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
    
    // Load saved name data
    loadSavedNameData();
    
    return () => clearTimeout(timer);
  }, []);
  
  // Save name data whenever it changes
  useEffect(() => {
    if (firstName || lastName) {
      saveNameData();
    }
  }, [firstName, lastName]);
  
  // Smart focus: Only focus inputs when empty or there's an error
  useEffect(() => {
    // Skip auto-focus logic if keyboard is visible and an input is already focused (user is typing)
    const keyboardVisible = Keyboard.isVisible ? Keyboard.isVisible() : false;
    const isAnyInputFocused = firstNameFocused || lastNameFocused;
    
    // Only run focus logic if keyboard is not visible or there's an error
    if (!isAnyInputFocused || errorMessage) {
      const timer = setTimeout(() => {
        // Focus first name if it's empty or has an error related to it
        if (!firstName || (errorMessage && errorMessage.toLowerCase().includes('first name'))) {
          firstNameInputRef.current?.focus();
        }
        // Focus last name if first name is filled but last name is empty or has an error
        else if (firstName && (!lastName || (errorMessage && errorMessage.toLowerCase().includes('last name')))) {
          lastNameInputRef.current?.focus();
        }
        // Dismiss keyboard if both inputs are filled and no errors AND no input is currently focused
        else if (firstName && lastName && !errorMessage && !isAnyInputFocused && !keyboardVisible) {
          Keyboard.dismiss();
        }
      }, 400); // Delay to allow animation to complete
      
      return () => clearTimeout(timer);
    }
  }, [firstName, lastName, errorMessage, firstNameFocused, lastNameFocused]);
  
  const loadSavedNameData = async () => {
    try {
      // Check if we have a valid session ID
      const sessionId = await AsyncStorage.getItem('signup_session_id');
      if (!sessionId) {
        // No session ID, don't load data
        return;
      }
      
      const savedFirstName = await AsyncStorage.getItem('signup_firstName');
      const savedLastName = await AsyncStorage.getItem('signup_lastName');
      
      if (savedFirstName) {
        setFirstName(savedFirstName);
      }
      
      if (savedLastName) {
        setLastName(savedLastName);
      }
    } catch (error) {
      console.error('Error loading saved name data:', error);
    }
  };
  
  const saveNameData = async () => {
    try {
      await AsyncStorage.setItem('signup_firstName', firstName);
      await AsyncStorage.setItem('signup_lastName', lastName);
    } catch (error) {
      console.error('Error saving name data:', error);
    }
  };

  const validateNames = () => {
    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name');
      return false;
    }
    
    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name');
      return false;
    }
    
    // Very simple validation - just check that names are not too short
    if (firstName.trim().length < 2) {
      setErrorMessage('First name is too short');
      return false;
    }
    
    if (lastName.trim().length < 2) {
      setErrorMessage('Last name is too short');
      return false;
    }
    
    return true;
  };

  const handleContinue = async () => {
    if (!validateNames()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      console.log('Display name collected:', fullName);
      
      // Save the full name for retrieval in case user navigates back
      await AsyncStorage.setItem('signup_fullName', fullName);
      
      // Dismiss keyboard first to prevent animation lag
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
        await AsyncStorage.setItem('auth_last_screen', 'CreateAccount');
        
        // Navigate directly to confirm password screen
        navigation.navigate('ConfirmPassword', { 
          email,
          fullName
        });
        
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
            
            <Text style={styles.title}>Enter your name as in legal documents</Text>
            <Text style={styles.subtitle}>e.g Ayotunde and not "Tunde"</Text>
            
            <View style={styles.formContainer}>
              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}
              
              <View style={styles.inputContainer}>
                <TextInput
                  ref={firstNameInputRef}
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  autoCapitalize="words"
                  autoComplete="name-given"
                  textContentType="givenName"
                  onFocus={() => setFirstNameFocused(true)}
                  onBlur={() => setFirstNameFocused(false)}
                />
              </View>
              
              <View style={styles.inputContainer}>
                <TextInput
                  ref={lastNameInputRef}
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  autoCapitalize="words"
                  autoComplete="name-family"
                  textContentType="familyName"
                  onFocus={() => setLastNameFocused(true)}
                  onBlur={() => setLastNameFocused(false)}
                />
              </View>
            </View>
            
            <View style={styles.bottomContainer}>
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
}); 
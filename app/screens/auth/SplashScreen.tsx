import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { checkForExistingAccount, resetAccountStatus } from '../../utils/accountUtils';
import { supabase } from '../../services/supabase';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const [checking, setChecking] = useState(true);
  const [hasAccount, setHasAccount] = useState(false);

  useEffect(() => {
    const checkAccount = async () => {
      try {
        // First check for an existing session - if we have one but no user data,
        // this might be a deleted account situation
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // We have a session, check if the user profile exists
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (error || !profile) {
            // User has a session but profile doesn't exist - likely a deleted account
            console.log('User session exists but profile missing - handling deleted account');
            await supabase.auth.signOut(); // Sign out the deleted account
            await resetAccountStatus(); // Reset the account status
            setHasAccount(false);
            setChecking(false);
            return;
          }
        }
        
        // Normal flow - check if account exists
        const exists = await checkForExistingAccount();
        setHasAccount(exists);
      } catch (error) {
        console.error('Error checking account:', error);
      } finally {
        setChecking(false);
      }
    };

    checkAccount();
  }, []);

  useEffect(() => {
    // Only navigate if we've finished checking
    if (!checking) {
      // If the user has an account, navigate to Login
      // Otherwise, navigate to onboarding
      if (hasAccount) {
        navigation.replace('Login');
      }
      // We don't automatically navigate to onboarding, we let the user click the button
    }
  }, [checking, hasAccount, navigation]);

  const handleGetStarted = () => {
    navigation.navigate('Onboarding1');
  };

  if (checking) {
    // Show loading while checking account status
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet-outline" size={80} color={colors.primary} />
          <Text style={styles.appName}>SplitNaira</Text>
        </View>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // If the user has an account, the useEffect will navigate to Login
  // So we only need to return the splash content if they don't have an account

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Ionicons name="wallet-outline" size={80} color={colors.primary} />
          <Text style={styles.appName}>SplitNaira</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Split Expenses with Friends</Text>
          <Text style={styles.subtitle}>
            Easily track shared expenses, settle debts, and manage group finances with your friends, family, and roommates.
          </Text>
        </View>
        
        <View style={styles.illustrations}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="people" size={80} color={colors.primary} />
          </View>
          <View style={[styles.illustrationCircle, styles.secondaryCircle]}>
            <Ionicons name="cash-outline" size={60} color={colors.secondary} />
          </View>
          <View style={[styles.illustrationCircle, styles.accentCircle]}>
            <Ionicons name="receipt-outline" size={60} color={colors.accent} />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.getStartedButton} 
          onPress={handleGetStarted}
        >
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  appName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: spacing.sm,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  illustrations: {
    width: width * 0.8,
    height: width * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 123, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: width * 0.2,
  },
  secondaryCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(108, 117, 125, 0.1)',
    bottom: 0,
    left: width * 0.1,
    top: 'auto',
  },
  accentCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253, 126, 20, 0.1)',
    right: width * 0.1,
    bottom: 20,
    left: 'auto',
    top: 'auto',
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: '100%',
  },
  getStartedButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
}); 
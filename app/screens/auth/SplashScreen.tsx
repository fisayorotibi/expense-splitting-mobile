import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type SplashScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Onboarding1');
  };

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
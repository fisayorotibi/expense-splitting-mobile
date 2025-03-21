import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';

type CongratulationsScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Congratulations'>;
type CongratulationsScreenRouteProp = RouteProp<AuthStackParamList, 'Congratulations'>;

export default function CongratulationsScreen() {
  const navigation = useNavigation<CongratulationsScreenNavigationProp>();
  const route = useRoute<CongratulationsScreenRouteProp>();
  
  const { email } = route.params;

  const handleContinue = () => {
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }], // This will redirect to login, but if you have auto-login after signup, you can navigate to the main app directly
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={80} color={colors.white} />
        </View>
        
        <Text style={styles.title}>Welcome to Expense Splitter!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully. You're now ready to log in with your email and password.
        </Text>
        
        <Text style={styles.emailInfo}>
          Your account: <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
        
        <View style={styles.loginInstructions}>
          <Text style={styles.instructionTitle}>What's Next?</Text>
          <Text style={styles.instructionText}>
            1. Click "Log In Now" below
          </Text>
          <Text style={styles.instructionText}>
            2. Enter your email and the password you just created
          </Text>
          <Text style={styles.instructionText}>
            3. Start using Expense Splitter!
          </Text>
        </View>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Ionicons name="people-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Create Circles</Text>
              <Text style={styles.featureDescription}>Organize expenses in circles with friends, family, or roommates</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="calculator-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Split Expenses</Text>
              <Text style={styles.featureDescription}>Easily track who owes what and settle up with minimal fuss</Text>
            </View>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="analytics-outline" size={26} color={colors.primary} style={styles.featureIcon} />
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Track Spending</Text>
              <Text style={styles.featureDescription}>See your spending history and patterns at a glance</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          onPress={handleContinue}
          fullWidth
          variant="primary"
          style={styles.continueButton}
        >
          Log In Now
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  emailInfo: {
    fontSize: fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  emailHighlight: {
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loginInstructions: {
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  instructionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  features: {
    width: '100%',
    marginTop: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    marginTop: 2,
    marginRight: spacing.md,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  featureDescription: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  continueButton: {
    height: 56,
  },
}); 
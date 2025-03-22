import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Dimensions,
  Modal,
  Animated,
  BackHandler
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/types';
import { colors, spacing, fontSizes, borderRadius } from '../../utils/theme';
import { Ionicons } from '@expo/vector-icons';

type Onboarding3ScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding3'>;

export default function Onboarding3Screen() {
  const navigation = useNavigation<Onboarding3ScreenNavigationProp>();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (authModalVisible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01
      }).start();
    } else {
      // Reset animation value when modal is closed
      slideAnim.setValue(0);
    }
  }, [authModalVisible, slideAnim]);

  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (authModalVisible) {
        closeModal();
        return true;
      }
      return false;
    });

    return () => backHandler.remove();
  }, [authModalVisible]);

  const handleContinue = () => {
    // Show the auth options modal instead of navigating
    setAuthModalVisible(true);
  };

  const closeModal = (callback?: () => void) => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAuthModalVisible(false);
      if (callback) callback();
    });
  };

  const handleEmailLogin = () => {
    closeModal(() => navigation.navigate('EnterEmail'));
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    // In a real app, implement the social login logic here
    console.log(`Login with ${provider}`);
    closeModal(() => navigation.navigate('Login'));
  };

  return (
    <SafeAreaView style={styles.container}>      
      <View style={styles.contentContainer}>
        <View style={styles.illustration}>
          <View style={styles.iconCircle}>
            <Ionicons name="people" size={80} color={colors.accent} />
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Create Circles</Text>
          <Text style={styles.subtitle}>
            Organize your expenses in circles with friends, family, roommates, and more.
          </Text>
        </View>
        
        <View style={styles.paginationContainer}>
          <View style={styles.paginationDot} />
          <View style={styles.paginationDot} />
          <View style={[styles.paginationDot, styles.activeDot]} />
        </View>
        
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Auth Options Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={authModalVisible}
        onRequestClose={() => closeModal()}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalView,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [200, 0]
                  })
                }],
                opacity: slideAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.7, 1]
                })
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign In or Sign Up</Text>
              <TouchableOpacity 
                onPress={() => closeModal()}
                hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
              >
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.emailButton} 
              onPress={handleEmailLogin}
            >
              <Ionicons name="mail-outline" size={20} color={colors.white} style={styles.buttonIcon} />
              <Text style={styles.emailButtonText}>Continue with Email</Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialButtons}>
              <TouchableOpacity 
                style={[styles.socialButton, styles.googleButton]} 
                onPress={() => handleSocialLogin('google')}
              >
                <Ionicons name="logo-google" size={20} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.socialButton, styles.appleButton]} 
                onPress={() => handleSocialLogin('apple')}
              >
                <Ionicons name="logo-apple" size={20} color={colors.white} style={styles.buttonIcon} />
                <Text style={styles.socialButtonText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  illustration: {
    width: width * 0.7,
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(253, 126, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
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
    paddingHorizontal: spacing.md,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border.light,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 20,
  },
  continueButton: {
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
  continueButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  emailButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emailButtonText: {
    color: colors.white,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  orText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginHorizontal: spacing.md,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  socialButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  socialButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
}); 
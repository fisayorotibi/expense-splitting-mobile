import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, fontSizes, borderRadius, shadows } from '../../utils/theme';
import { Button } from '../../components/Button';
import { ScreenHeader } from '../../components/ScreenHeader';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();

              // Instead of using navigation.reset, we'll work with the root navigator
              // Let the RootNavigator handle the state change naturally
              // The auth state change listener in RootNavigator will detect the session is null
              // and navigate to Auth automatically
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const navigateToEditProfile = () => {
    navigation.navigate('ProfileStack', { screen: 'EditProfile' });
  };

  const navigateToSettings = () => {
    navigation.navigate('ProfileStack', { screen: 'Settings' });
  };

  const navigateToNotifications = () => {
    navigation.navigate('ProfileStack', { screen: 'Notifications' });
  };

  const navigateToFriends = () => {
    navigation.navigate('ProfileStack', { screen: 'Friends' });
  };

  const profileMenuItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    onPress: () => void,
    showDivider: boolean = true
  ) => (
    <React.Fragment>
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={20} color={colors.text.primary} />
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.gray[400]} />
      </TouchableOpacity>
      {showDivider && <View style={styles.divider} />}
    </React.Fragment>
  );

  return (
    <ScreenHeader
      title="Profile"
      headerSize="medium"
      titleAlignment="left"
      rightAction={{
        icon: 'cog-outline',
        onPress: navigateToSettings
      }}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {profile?.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.profileImage}
          />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.full_name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'user@example.com'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={navigateToEditProfile}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          {profileMenuItem('person-outline', 'Edit Profile', navigateToEditProfile)}
          {profileMenuItem('people-outline', 'Friends', navigateToFriends)}
          {profileMenuItem('settings-outline', 'Settings', navigateToSettings)}
          {profileMenuItem('notifications-outline', 'Notifications', navigateToNotifications, false)}
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionContent}>
          {profileMenuItem('help-circle-outline', 'Help Center', () => Alert.alert('Help Center', 'This feature is coming soon'))}
          {profileMenuItem('document-text-outline', 'Terms of Service', () => Alert.alert('Terms of Service', 'This feature is coming soon'))}
          {profileMenuItem('shield-checkmark-outline', 'Privacy Policy', () => Alert.alert('Privacy Policy', 'This feature is coming soon'), false)}
        </View>
      </View>

      {/* App Info Section */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>SplitWise v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2023 SplitWise Nigeria</Text>
      </View>

      {/* Sign Out Button */}
      <Button
        variant="outline"
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageText: {
    color: colors.white,
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  profileEmail: {
    fontSize: fontSizes.sm,
    color: colors.text.secondary,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: spacing.xxxl,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  appVersion: {
    fontSize: fontSizes.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  appCopyright: {
    fontSize: fontSizes.xs,
    color: colors.text.tertiary,
  },
  signOutButton: {
    marginBottom: spacing.xl,
  },
}); 
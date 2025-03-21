import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, fontSizes, fontWeights, shadows } from '../utils/theme';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
  };
  leftAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
  };
  largeTitleMode?: boolean;
  transparent?: boolean;
  tintColor?: string;
}

export const Header = ({
  title,
  showBackButton = false,
  rightAction,
  leftAction,
  largeTitleMode = false,
  transparent = false,
  tintColor = colors.primary
}: HeaderProps) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const handleBackPress = () => {
    navigation.goBack();
  };

  const headerHeight = largeTitleMode ? 90 : 44;
  const paddingTop = Platform.OS === 'ios' ? insets.top : StatusBar.currentHeight || 0;

  return (
    <View style={[
      styles.container, 
      { paddingTop, height: headerHeight + paddingTop },
      transparent && styles.transparentHeader
    ]}>
      <StatusBar
        barStyle={transparent ? "light-content" : "dark-content"}
        backgroundColor={transparent ? 'transparent' : colors.background.secondary}
        translucent
      />
      
      {/* Standard Title Header */}
      <View style={styles.standardHeader}>
        {/* Left Side - Back Button or Custom Left Action */}
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={transparent ? colors.white : tintColor} 
              />
            </TouchableOpacity>
          )}
          
          {leftAction && !showBackButton && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={leftAction.onPress}
            >
              {leftAction.icon && (
                <Ionicons 
                  name={leftAction.icon} 
                  size={24} 
                  color={transparent ? colors.white : tintColor} 
                  style={leftAction.label ? { marginRight: 4 } : undefined}
                />
              )}
              {leftAction.label && (
                <Text style={[
                  styles.actionLabel, 
                  { color: transparent ? colors.white : tintColor }
                ]}>
                  {leftAction.label}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* Center Title */}
        {!largeTitleMode && (
          <Text 
            style={[
              styles.title, 
              { color: transparent ? colors.white : colors.text.primary }
            ]} 
            numberOfLines={1}
          >
            {title}
          </Text>
        )}
        
        {/* Right Side - Action Button */}
        <View style={styles.rightContainer}>
          {rightAction && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={rightAction.onPress}
            >
              {rightAction.label && (
                <Text style={[
                  styles.actionLabel, 
                  { color: transparent ? colors.white : tintColor }
                ]}>
                  {rightAction.label}
                </Text>
              )}
              {rightAction.icon && (
                <Ionicons 
                  name={rightAction.icon} 
                  size={24} 
                  color={transparent ? colors.white : tintColor} 
                  style={rightAction.label ? { marginLeft: 4 } : undefined}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Large Title (iOS 11+ style) */}
      {largeTitleMode && (
        <Text 
          style={[
            styles.largeTitle,
            { color: transparent ? colors.white : colors.text.primary }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    paddingHorizontal: spacing.md,
  },
  transparentHeader: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  standardHeader: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  title: {
    flex: 2,
    textAlign: 'center',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  largeTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  backButton: {
    padding: spacing.xs,
    marginLeft: -spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  actionLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
}); 
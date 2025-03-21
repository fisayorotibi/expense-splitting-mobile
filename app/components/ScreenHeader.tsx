import React, { ReactNode } from 'react';
import { View, StyleSheet, ScrollView, RefreshControlProps, RefreshControl } from 'react-native';
import { Header } from './Header';
import { colors, spacing } from '../utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ScreenHeaderProps {
  title: string;
  children: ReactNode;
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
  useLargeTitle?: boolean;
  transparent?: boolean;
  scrollEnabled?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  tintColor?: string;
}

export const ScreenHeader = ({
  title,
  children,
  showBackButton = false,
  rightAction,
  leftAction,
  useLargeTitle = false,
  transparent = false,
  scrollEnabled = true,
  refreshControl,
  tintColor
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  
  // Wrap content in ScrollView if scrollEnabled is true
  const Content = () => (
    <View style={[
      styles.contentContainer,
      { paddingBottom: insets.bottom || spacing.md }
    ]}>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={title}
        showBackButton={showBackButton}
        rightAction={rightAction}
        leftAction={leftAction}
        largeTitleMode={useLargeTitle}
        transparent={transparent}
        tintColor={tintColor}
      />
      
      {scrollEnabled ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
        >
          <Content />
        </ScrollView>
      ) : (
        <Content />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: spacing.lg,
  },
}); 
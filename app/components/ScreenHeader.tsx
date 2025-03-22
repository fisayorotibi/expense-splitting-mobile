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
  headerSize?: 'medium' | 'large';
  titleAlignment?: 'center' | 'left';
  transparent?: boolean;
  scrollEnabled?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  tintColor?: string;
  logoComponent?: React.ReactNode;
}

export const ScreenHeader = ({
  title,
  children,
  showBackButton = false,
  rightAction,
  leftAction,
  headerSize = 'medium',
  titleAlignment = 'center',
  transparent = false,
  scrollEnabled = true,
  refreshControl,
  tintColor,
  logoComponent
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
        headerSize={headerSize}
        titleAlignment={titleAlignment}
        transparent={transparent}
        tintColor={tintColor}
        logoComponent={logoComponent}
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
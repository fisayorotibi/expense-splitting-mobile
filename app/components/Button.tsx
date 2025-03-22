import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fontSizes, fontWeights, borderRadius, spacing } from '../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) => {
  const getButtonStyles = (): ViewStyle => {
    let buttonStyle: ViewStyle = {};

    // Variant styles
    switch (variant) {
      case 'primary':
        buttonStyle = {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        };
        break;
      case 'secondary':
        buttonStyle = {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
        };
        break;
      case 'outline':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1,
        };
        break;
      case 'danger':
        buttonStyle = {
          backgroundColor: colors.danger,
          borderColor: colors.danger,
        };
        break;
      case 'text':
        buttonStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
        };
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          height: 40,
        };
        break;
      case 'medium':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          height: 52,
        };
        break;
      case 'large':
        buttonStyle = {
          ...buttonStyle,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          height: 60,
        };
        break;
    }

    // Full width style
    if (fullWidth) {
      buttonStyle.width = '100%';
    }

    // Disabled style
    if (disabled || loading) {
      buttonStyle.opacity = 0.6;
    }

    return buttonStyle;
  };

  const getTextStyles = (): TextStyle => {
    let textStyle: TextStyle = {};

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        textStyle = {
          color: colors.text.inverse,
        };
        break;
      case 'outline':
      case 'text':
        textStyle = {
          color: colors.primary,
        };
        break;
    }

    // Size styles
    switch (size) {
      case 'small':
        textStyle = {
          ...textStyle,
          fontSize: fontSizes.sm,
        };
        break;
      case 'medium':
        textStyle = {
          ...textStyle,
          fontSize: fontSizes.md,
        };
        break;
      case 'large':
        textStyle = {
          ...textStyle,
          fontSize: fontSizes.lg,
        };
        break;
    }

    return textStyle;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyles(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.white} 
        />
      ) : (
        <Text style={[styles.text, getTextStyles(), textStyle]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
}); 
/**
 * Beautiful Modern Accessible Button Component
 * Enhanced with gradients, shadows, and animations
 */
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Vibration, Animated } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const AccessibleButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  hapticFeedback = true,
  gradient = false,
  ...props
}) => {
  const { settings, getAccessibilityProps, getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const accessibilityProps = getAccessibilityProps('button');
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (hapticFeedback && settings.hapticFeedback) {
      Vibration.vibrate(50); // Short vibration for button press
    }
    onPress();
  };

  const getButtonStyle = () => {
    const baseStyle = {
      ...accessibilityProps.style,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      opacity: disabled ? 0.6 : 1,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    };

    const variantStyles = {
      primary: {
        backgroundColor: gradient ? 'transparent' : colors.primary,
      },
      secondary: {
        backgroundColor: gradient ? 'transparent' : colors.secondary,
      },
      accent: {
        backgroundColor: gradient ? 'transparent' : colors.accent,
      },
      success: {
        backgroundColor: gradient ? 'transparent' : colors.success,
      },
      warning: {
        backgroundColor: gradient ? 'transparent' : colors.warning,
      },
      error: {
        backgroundColor: gradient ? 'transparent' : colors.error,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 36,
        borderRadius: 8,
      },
      medium: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
        borderRadius: 10,
      },
      large: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        minHeight: 52,
        borderRadius: 12,
      },
      'extra-large': {
        paddingHorizontal: 24,
        paddingVertical: 20,
        minHeight: 64,
        borderRadius: 16,
      },
    };

    return [
      baseStyle,
      variantStyles[variant],
      sizeStyles[size],
      style,
    ];
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      color: variant === 'outline' || variant === 'ghost' ? colors.primary : 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    };

    const sizeTextStyles = {
      small: { fontSize: 14 },
      medium: { fontSize: 16 },
      large: { fontSize: 18 },
      'extra-large': { fontSize: 20 },
    };

    return [
      baseTextStyle,
      sizeTextStyles[size],
      textStyle,
    ];
  };

  const getGradientColors = () => {
    const gradientMap = {
      primary: ['#667eea', '#764ba2'],
      secondary: ['#f093fb', '#f5576c'],
      accent: ['#4facfe', '#00f2fe'],
      success: ['#43e97b', '#38f9d7'],
      warning: ['#fa709a', '#fee140'],
      error: ['#ff6b6b', '#ee5a24'],
    };
    return gradientMap[variant] || gradientMap.primary;
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        {...accessibilityProps}
        {...props}
      >
        {gradient ? (
          <View style={styles.gradientContainer}>
            <Text style={getTextStyle()}>
              {title}
            </Text>
          </View>
        ) : (
          <Text style={getTextStyle()}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AccessibleButton;
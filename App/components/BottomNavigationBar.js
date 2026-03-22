/**
 * Bottom Navigation Bar Component
 * Provides consistent navigation across all screens
 */
import React, { useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Users, Hand, Settings } from 'lucide-react-native';
import { useAccessibility } from './AccessibilityProvider';

// Purple Theme Color Palette - Matching DashboardScreen
const PURPLE_THEME = {
  primary50: '#F5F3FF',
  primary100: '#EDE9FE',
  primary200: '#DDD6FE',
  primary300: '#C4B5FD',
  primary400: '#A78BFA',
  primary500: '#8B5CF6',
  primary600: '#7C3AED',
  primary700: '#6D28D9',
  primary800: '#5B21B6',
  primary900: '#4C1D95',
  accent500: '#C084FC',
  accent600: '#A855F7',
  accent700: '#9333EA',
  accent800: '#7E22CE',
  accent900: '#6B21A8',
  background: '#FAF5FF',
  surface: '#FFFFFF',
  textPrimary: '#2E1065',
  textSecondary: '#6B21A8',
  shadowLight: 'rgba(139, 92, 246, 0.1)',
  shadowMedium: 'rgba(139, 92, 246, 0.15)',
  shadowDark: 'rgba(109, 40, 217, 0.2)',
};

const BottomNavigationBar = ({ navigation, state }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const insets = useSafeAreaInsets();

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: Home,
      accessibilityLabel: 'Home',
      accessibilityHint: 'Go home'
    },
    { 
      name: 'Contacts', 
      icon: Users,
      accessibilityLabel: 'Contacts',
      accessibilityHint: 'Go to contacts'
    },
    { 
      name: 'GestureTraining', 
      icon: Hand,
      accessibilityLabel: 'Practice',
      accessibilityHint: 'Go to practice'
    },
    { 
      name: 'Settings', 
      icon: Settings,
      accessibilityLabel: 'Settings',
      accessibilityHint: 'Go to settings'
    },
  ];

  const scalesRef = useRef({});

  const handleNavigation = (screenName) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: screenName,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(screenName);
    }
  };

  const handlePressIn = (key) => {
    if (!scalesRef.current[key]) {
      scalesRef.current[key] = new Animated.Value(1);
    }
    Animated.spring(scalesRef.current[key], {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start();
  };

  const handlePressOut = (key) => {
    if (!scalesRef.current[key]) {
      scalesRef.current[key] = new Animated.Value(1);
    }
    Animated.spring(scalesRef.current[key], {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 150,
    }).start();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: PURPLE_THEME.primary800, borderTopColor: PURPLE_THEME.primary700 }]}>
      {navItems.map((item) => {
        const isActive = state.routes[state.index]?.name === item.name;
        if (!scalesRef.current[item.name]) {
          scalesRef.current[item.name] = new Animated.Value(1);
        }
        const scale = scalesRef.current[item.name];
        const IconComponent = item.icon;

        return (
          <TouchableOpacity
            key={item.name}
            style={styles.navItem}
            onPress={() => handleNavigation(item.name)}
            onPressIn={() => handlePressIn(item.name)}
            onPressOut={() => handlePressOut(item.name)}
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel}
            accessibilityHint={item.accessibilityHint}
            accessibilityState={{ selected: isActive }}
          >
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: isActive ? PURPLE_THEME.accent600 : 'transparent',
                  transform: [{ scale }],
                },
              ]}
            >
              <IconComponent
                size={24}
                strokeWidth={2}
                color={isActive ? '#FFFFFF' : PURPLE_THEME.primary200}
              />
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 100,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: PURPLE_THEME.shadowDark,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 999,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNavigationBar;

/**
 * Bottom Navigation Bar Component
 * Provides consistent navigation across all screens
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccessibility } from './AccessibilityProvider';

const BottomNavigationBar = ({ navigation, state }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();
  const insets = useSafeAreaInsets();

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: '\ud83c\udfe0',
      accessibilityLabel: 'Home',
      accessibilityHint: 'Go home'
    },
    { 
      name: 'Contacts', 
      icon: '\ud83d\udc65',
      accessibilityLabel: 'Contacts',
      accessibilityHint: 'Go to contacts'
    },
    { 
      name: 'GestureTraining', 
      icon: '\u270b',
      accessibilityLabel: 'Practice',
      accessibilityHint: 'Go to practice'
    },
    { 
      name: 'Settings', 
      icon: '\u2699\ufe0f',
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
    <View style={[styles.container, { paddingBottom: insets.bottom, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {navItems.map((item) => {
        const isActive = state.routes[state.index]?.name === item.name;
        if (!scalesRef.current[item.name]) {
          scalesRef.current[item.name] = new Animated.Value(1);
        }
        const scale = scalesRef.current[item.name];

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
                  backgroundColor: isActive ? colors.primary : 'transparent',
                  transform: [{ scale }],
                },
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  { color: isActive ? '#FFFFFF' : colors.primary },
                ]}
              >
                {item.icon}
              </Text>
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
    height: 60,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
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
  },
  navIcon: {
    fontSize: 20,
  },
});

export default BottomNavigationBar;

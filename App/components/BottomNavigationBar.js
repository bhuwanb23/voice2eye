/**
 * Bottom Navigation Bar Component
 * Provides consistent navigation across all screens
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const BottomNavigationBar = ({ navigation, currentRoute }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const navItems = [
    { 
      name: 'Dashboard', 
      icon: '🏠', 
      label: 'Home',
      accessibilityHint: 'Navigate to dashboard screen'
    },
    { 
      name: 'Contacts', 
      icon: '👥', 
      label: 'Contacts',
      accessibilityHint: 'Navigate to emergency contacts screen'
    },
    { 
      name: 'GestureTraining', 
      icon: '✋', 
      label: 'Gestures',
      accessibilityHint: 'Navigate to gesture training screen'
    },
    { 
      name: 'Settings', 
      icon: '⚙️', 
      label: 'Settings',
      accessibilityHint: 'Navigate to settings screen'
    },
  ];

  const handleNavigation = (screenName) => {
    if (currentRoute !== screenName) {
      navigation.navigate(screenName);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[
            styles.navItem,
            currentRoute === item.name && styles.activeItem
          ]}
          onPress={() => handleNavigation(item.name)}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityHint={item.accessibilityHint}
          accessibilityState={{ selected: currentRoute === item.name }}
        >
          <Text style={[
            styles.navIcon,
            { color: currentRoute === item.name ? colors.primary : colors.textSecondary }
          ]}>
            {item.icon}
          </Text>
          <Text style={[
            styles.navLabel,
            { 
              color: currentRoute === item.name ? colors.primary : colors.textSecondary,
              fontWeight: currentRoute === item.name ? 'bold' : 'normal'
            }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
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
  activeItem: {
    borderTopWidth: 2,
    borderTopColor: '#4A90E2',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 12,
  },
});

export default BottomNavigationBar;
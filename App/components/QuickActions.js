/**
 * Enhanced Quick Actions Component
 * Beautifully designed quick action cards with improved visual hierarchy
 */
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useAccessibility } from '../components/AccessibilityProvider';
import AccessibleButton from '../components/AccessibleButton';

const { width } = Dimensions.get('window');

const QuickActions = ({ actions }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action, index) => (
          <View 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.gradient[0] }]}>
              <Text style={styles.icon}>{action.icon}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>{action.subtitle}</Text>
            </View>
            <AccessibleButton
              title="Activate"
              onPress={action.onPress}
              variant="primary"
              size="small"
              accessibilityLabel={action.accessibilityLabel}
              accessibilityHint={action.accessibilityHint}
              style={styles.actionButton}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 4,
  },
  grid: {
    flexDirection: 'column',
    gap: 12,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  actionButton: {
    minWidth: 90,
  },
});

export default QuickActions;
/**
 * Recommendations Component
 * Displays personalized training recommendations
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const Recommendations = ({ recommendations }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <View style={[stylesBase.container, { backgroundColor: colors.surface }]}>
      <Text style={[stylesBase.sectionTitle, { color: colors.text }]}>
        Training Recommendations
      </Text>
      <View style={stylesBase.recommendationsContainer}>
        {recommendations.map((recommendation, index) => (
          <View key={index} style={stylesBase.recommendationItem}>
            <Text style={[stylesBase.recommendationText, { color: colors.text }]}>
              💡 {recommendation}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const stylesBase = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  recommendationsContainer: {
    paddingBottom: 10,
  },
  recommendationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  recommendationText: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default Recommendations;
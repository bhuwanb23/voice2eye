/**
 * Progress Statistics Component
 * Displays user's gesture training progress and statistics
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from '../../components/AccessibilityProvider';

const ProgressStats = ({ gestureProgress, accuracyMetrics, gestures, getAccuracyColor }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  if (!gestureProgress || Object.keys(gestureProgress).length === 0) return null;

  return (
    <View style={[stylesBase.container, { backgroundColor: colors.surface }]}>
      <Text style={[stylesBase.sectionTitle, { color: colors.text }]}>
        Practice Statistics
      </Text>
      
      <View style={stylesBase.statsContainer}>
        {Object.entries(gestureProgress).map(([gestureId, count]) => {
          const gesture = gestures.find(g => g.id === gestureId);
          const metrics = accuracyMetrics[gestureId];
          
          if (!gesture) return null;
          
          return (
            <View key={gestureId} style={[stylesBase.statItem, { backgroundColor: colors.surface }]}>
              <View style={stylesBase.gestureInfo}>
                <Text style={[stylesBase.gestureEmoji, { fontSize: 24 }]}>
                  {gesture.emoji}
                </Text>
                <Text style={[stylesBase.gestureName, { color: colors.text }]}>
                  {gesture.name}
                </Text>
              </View>
              
              <View style={stylesBase.statsDetails}>
                <View style={stylesBase.statBlock}>
                  <Text style={[stylesBase.statLabel, { color: colors.textSecondary }]}>
                    Practiced
                  </Text>
                  <Text style={[stylesBase.statValue, { color: colors.primary }]}>
                    {count} times
                  </Text>
                </View>
                
                {metrics && (
                  <View style={stylesBase.statBlock}>
                    <Text style={[stylesBase.statLabel, { color: colors.textSecondary }]}>
                      Accuracy
                    </Text>
                    <Text style={[stylesBase.statValue, { color: getAccuracyColor(metrics.accuracy) }]}>
                      {metrics.accuracy}%
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  statsContainer: {
    paddingBottom: 10,
  },
  statItem: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  gestureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gestureEmoji: {
    marginRight: 12,
  },
  gestureName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBlock: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressStats;
/**
 * Service Status Component
 * Displays real-time status indicators for all system services
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAccessibility } from './AccessibilityProvider';

const ServiceStatus = ({ serviceStatus }) => {
  const { getThemeColors } = useAccessibility();
  const colors = getThemeColors();

  const services = [
    { 
      name: 'Speech', 
      status: serviceStatus.speech, 
      icon: '🎤',
      color: serviceStatus.speech === 'ready' ? colors.success : colors.error
    },
    { 
      name: 'Gesture', 
      status: serviceStatus.gesture, 
      icon: '✋',
      color: serviceStatus.gesture === 'ready' ? colors.success : colors.error
    },
    { 
      name: 'Emergency', 
      status: serviceStatus.emergency, 
      icon: '🚨',
      color: serviceStatus.emergency === 'ready' ? colors.success : colors.error
    },
    { 
      name: 'Camera', 
      status: serviceStatus.camera, 
      icon: '📷',
      color: serviceStatus.camera === 'ready' ? colors.success : colors.error
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Status</Text>
      <View style={styles.grid}>
        {services.map((service, index) => (
          <View 
            key={index} 
            style={[styles.card, { backgroundColor: colors.surface }]}
            accessible={true}
            accessibilityLabel={`${service.name} service is ${service.status}`}
          >
            <Text style={[styles.icon, { color: service.color }]}>{service.icon}</Text>
            <Text style={[styles.status, { color: service.color }]}>
              {service.status === 'ready' ? '✓ Ready' : '✗ Offline'}
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>{service.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ServiceStatus;
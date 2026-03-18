import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function LoadingSpinner({ size = 'large', overlay = false }) {
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <ActivityIndicator size={size} color={COLORS.primary} />
      </View>
    );
  }
  return (
    <View style={styles.center}>
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,26,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

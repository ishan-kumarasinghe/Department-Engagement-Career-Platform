import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');
}

function colorFromName(name = '') {
  const colors = ['#6C63FF', '#00C9A7', '#FF5370', '#FFB300', '#4F8EF7'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ uri, name = '', size = 40 }) {
  const initials = getInitials(name);
  const bgColor = colorFromName(name);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: COLORS.border },
  fallback: { justifyContent: 'center', alignItems: 'center' },
  initials: { color: '#fff', fontWeight: '700' },
});

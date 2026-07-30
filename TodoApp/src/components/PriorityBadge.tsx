import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Zap, Leaf, LucideIcon } from 'lucide-react-native';
import { Priority } from '../types';

const COLORS: Record<Priority, { bg: string; text: string }> = {
  high: { bg: '#FEE2E2', text: '#B91C1C' },
  medium: { bg: '#FEF3C7', text: '#B45309' },
  low: { bg: '#DCFCE7', text: '#15803D' },
};

const LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const ICONS: Record<Priority, LucideIcon> = {
  high: Flame,
  medium: Zap,
  low: Leaf,
};

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const colors = COLORS[priority];
  const Icon = ICONS[priority];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Icon size={12} color={colors.text} />
      <Text style={[styles.text, { color: colors.text }]}>{LABELS[priority]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default PriorityBadge;

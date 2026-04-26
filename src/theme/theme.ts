import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F7F9FC', // Soft off-white
  surface: '#FFFFFF',    // Clean white for cards
  primary: '#4A90E2',    // Calming primary blue
  primaryLight: '#E3EFFB', // Light blue background for active states
  text: '#2C3E50',       // Charcoal/slate gray
  textSecondary: '#7F8C8D',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  phantom: '#8E44AD',    // Purple for phantom overriding
  border: '#EAECEE',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  radius: 20,
};

export const SHADOWS = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  }
});

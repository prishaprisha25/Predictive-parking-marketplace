import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions, StatusBar,
} from 'react-native';
import { COLORS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

const STEPS = [
  { icon: '🗺️', text: 'Loading city maps...' },
  { icon: '🅿️', text: 'Fetching parking spots...' },
  { icon: '🤖', text: 'Calibrating AI predictions...' },
  { icon: '✅', text: 'Ready to park smart!' },
];

export default function SplashScreenView({ onFinish }: Props) {
  // ── Animation refs ────────────────────────────────────────────────────────
  const bgFade       = useRef(new Animated.Value(0)).current;
  const orbScale     = useRef(new Animated.Value(0)).current;
  const orbOpacity   = useRef(new Animated.Value(0)).current;
  const ringScale    = useRef(new Animated.Value(0.8)).current;
  const ringOpacity  = useRef(new Animated.Value(0)).current;
  const logoY        = useRef(new Animated.Value(30)).current;
  const logoOpacity  = useRef(new Animated.Value(0)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const taglineY     = useRef(new Animated.Value(20)).current;
  const badgeOp      = useRef(new Animated.Value(0)).current;
  const progressW    = useRef(new Animated.Value(0)).current;
  const screenOpOut  = useRef(new Animated.Value(1)).current;

  const [stepIndex, setStepIndex] = useState(0);
  const stepOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1) Background fade in
    Animated.timing(bgFade, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    // 2) Ring expand
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(ringScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
        Animated.timing(ringOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();

    // 3) Orb pop in
    Animated.sequence([
      Animated.delay(350),
      Animated.parallel([
        Animated.spring(orbScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
        Animated.timing(orbOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // 4) Logo text slide up
    Animated.sequence([
      Animated.delay(650),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // 5) Tagline
    Animated.sequence([
      Animated.delay(950),
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // 6) City badge
    Animated.sequence([
      Animated.delay(1150),
      Animated.timing(badgeOp, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // 7) Progress bar fill over 2.6s
    Animated.sequence([
      Animated.delay(1300),
      Animated.timing(progressW, {
        toValue: width * 0.72, duration: 2600,
        useNativeDriver: false,
      }),
    ]).start();

    // 8) Cycle loading steps
    const stepDuration = 850;
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    STEPS.forEach((_, i) => {
      stepTimers.push(
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(stepOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(stepOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
          ]).start();
          setStepIndex(i);
        }, 1300 + i * stepDuration),
      );
    });

    // 9) Fade out entire screen and call onFinish
    const exitTimer = setTimeout(() => {
      Animated.timing(screenOpOut, {
        toValue: 0, duration: 600, useNativeDriver: true,
      }).start(() => onFinish());
    }, 4200);

    return () => {
      stepTimers.forEach(clearTimeout);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpOut }]}>
      <StatusBar barStyle="light-content" backgroundColor="#07071A" />

      {/* Background gradient overlay */}
      <Animated.View style={[styles.bg, { opacity: bgFade }]} />

      {/* Decorative grid lines */}
      <View style={styles.gridContainer}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={`h${i}`} style={[styles.gridLineH, { top: (height / 8) * i }]} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={`v${i}`} style={[styles.gridLineV, { left: (width / 6) * i }]} />
        ))}
      </View>

      {/* Outer pulse ring */}
      <Animated.View style={[
        styles.ring,
        { transform: [{ scale: ringScale }], opacity: ringOpacity },
      ]} />

      {/* Orb / Logo icon */}
      <Animated.View style={[
        styles.orb,
        { transform: [{ scale: orbScale }], opacity: orbOpacity },
      ]}>
        <Text style={styles.orbIcon}>🅿️</Text>
      </Animated.View>

      {/* App name */}
      <Animated.View style={[
        styles.logoWrap,
        { opacity: logoOpacity, transform: [{ translateY: logoY }] },
      ]}>
        <Text style={styles.appName}>
          <Text style={styles.appNameAccent}>Predictive</Text> Parking
        </Text>
        <Text style={[styles.appName, { fontSize: 24, marginTop: -5 }]}>Marketplace</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[
        styles.taglineWrap,
        { opacity: taglineOp, transform: [{ translateY: taglineY }] },
      ]}>
        <Text style={styles.tagline}>AI-Powered · Predictive · Seamless</Text>
      </Animated.View>

      {/* City badges */}
      <Animated.View style={[styles.badgeRow, { opacity: badgeOp }]}>
        {['🏙 Chandigarh', '🌆 Mumbai'].map(city => (
          <View key={city} style={styles.cityBadge}>
            <Text style={styles.cityBadgeText}>{city}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Loading step */}
      <Animated.View style={[styles.stepRow, { opacity: stepOpacity }]}>
        <Text style={styles.stepIcon}>{STEPS[stepIndex].icon}</Text>
        <Text style={styles.stepText}>{STEPS[stepIndex].text}</Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressW }]} />
      </View>

      {/* Version tag */}
      <Text style={styles.version}>v1.0.0 · Hackathon Edition</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#07071A',
    alignItems: 'center', justifyContent: 'center',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D2B',
  },

  // Grid
  gridContainer: { ...StyleSheet.absoluteFillObject, opacity: 0.06 },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#4A90E2' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#4A90E2' },

  // Ring
  ring: {
    position: 'absolute',
    width: 260, height: 260, borderRadius: 130,
    borderWidth: 1.5, borderColor: '#4A90E2',
  },

  // Orb
  orb: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: '#4A90E2',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 50,
    elevation: 30, marginBottom: 0,
  },
  orbIcon: { fontSize: 54 },

  // Logo
  logoWrap: { marginTop: 28, alignItems: 'center' },
  appName: {
    fontSize: 32, fontWeight: '900', color: '#FFFFFF',
    letterSpacing: 1, textAlign: 'center',
  },
  appNameAccent: { color: '#4A90E2' },

  // Tagline
  taglineWrap: { marginTop: 8 },
  tagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2, fontWeight: '500',
  },

  // City badges
  badgeRow: {
    flexDirection: 'row', gap: 10, marginTop: 28,
  },
  cityBadge: {
    borderWidth: 1, borderColor: 'rgba(74,144,226,0.4)',
    backgroundColor: 'rgba(74,144,226,0.1)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  cityBadgeText: { color: '#4A90E2', fontSize: 12, fontWeight: '700' },

  // Loading step
  stepRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 44, height: 24,
  },
  stepIcon: { fontSize: 16 },
  stepText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' },

  // Progress bar
  progressTrack: {
    width: width * 0.72, height: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2, marginTop: 12, overflow: 'hidden',
  },
  progressFill: {
    height: 3, borderRadius: 2,
    backgroundColor: '#4A90E2',
  },

  // Version
  version: {
    position: 'absolute', bottom: 44,
    color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: '500',
    letterSpacing: 1,
  },
});

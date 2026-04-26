import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Alert, Linking,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Mic, X, Navigation2, CheckCircle2, Zap, Shield, MapPin } from 'lucide-react-native';
import { COLORS, SIZES } from '../theme/theme';
import { CHANDIGARH_SPOTS, MUMBAI_SPOTS } from '../utils/mockData';
import { useApp } from '../context/AppContext';

const VOICE_LINES = [
  '"Calculating the fastest route to your parking spot..."',
  '"Traffic is light ahead. ETA in 2 minutes."',
  '"Spot confirmed available. Proceed to the entry gate."',
  '"Auto-checkout armed. Your wallet is ready."',
  '"You are 200m away. Reduce speed and turn right."',
  '"Parking spot reserved. No need to search!"',
  '"AI predicts 95% chance spot is free when you arrive."',
];

export default function AmbientDrivingScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { activeBooking, walletBalance } = useApp();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [voiceIndex, setVoiceIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Find target spot
  const allSpots = [...CHANDIGARH_SPOTS, ...MUMBAI_SPOTS];
  const targetSpot = activeBooking
    ? allSpots.find(s => s.id === activeBooking.spotId) ?? allSpots[0]
    : allSpots[0];

  useEffect(() => {
    // Inner orb pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.12, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();

    // Outer ring expand
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1.5, duration: 2400, useNativeDriver: true }),
        Animated.timing(ringAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
      ]),
    ).start();

    // Voice line rotation with fade
    const voiceTimer = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setVoiceIndex(i => (i + 1) % VOICE_LINES.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 3500);

    // Elapsed time counter
    const timeTimer = setInterval(() => setElapsed(e => e + 1), 1000);

    return () => {
      clearInterval(voiceTimer);
      clearInterval(timeTimer);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${targetSpot.latitude},${targetSpot.longitude}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
  };

  const handleCheckout = () => {
    Alert.alert(
      '⚡ Confirm Geo-Checkout',
      `Exit ${targetSpot.title}?\n\nAmount: ₹${activeBooking?.amountPaid ?? targetSpot.dynamicPrice}\nWallet after: ₹${walletBalance - (activeBooking?.amountPaid ?? 0)}`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Checkout Now',
          onPress: () => {
            navigation.goBack();
            setTimeout(() =>
              Alert.alert(
                '✅ Checked Out Successfully',
                'Payment processed. Thank you for using ParkSmart!\n\nDrive safely. 🚗',
              ), 500,
            );
          },
        },
      ],
    );
  };

  return (
    <View style={st.container}>
      {/* Close button */}
      <TouchableOpacity style={st.closeBtn} onPress={() => navigation.goBack()}>
        <X color="rgba(255,255,255,0.7)" size={24} />
      </TouchableOpacity>

      {/* Top info bar */}
      <View style={st.topBar}>
        <View style={st.topLeft}>
          <Text style={st.topLabel}>Navigating to</Text>
          <Text style={st.topTitle} numberOfLines={1}>{targetSpot.title}</Text>
          <View style={st.topAddr}>
            <MapPin size={10} color="rgba(255,255,255,0.5)" />
            <Text style={st.topAddrText} numberOfLines={1}>{targetSpot.address}</Text>
          </View>
        </View>
        <View style={st.etaBox}>
          <Text style={st.etaVal}>{targetSpot.estimatedArrival}</Text>
          <Text style={st.etaLabel}>ETA</Text>
        </View>
      </View>

      {/* Main orb section */}
      <View style={st.orbSection}>
        {/* Outer ring */}
        <Animated.View style={[st.ring, { transform: [{ scale: ringAnim }], opacity: ringAnim.interpolate({ inputRange: [1, 1.5], outputRange: [0.4, 0] }) }]} />

        {/* Orb */}
        <Animated.View style={[st.orb, { transform: [{ scale: pulseAnim }] }]}>
          <Mic color="#fff" size={48} />
        </Animated.View>

        <Text style={st.modeTitle}>Ambient Mode Active</Text>
        <Text style={st.modeSub}>AI Voice  ·  AR Navigation  ·  Auto-Checkout</Text>

        {/* Voice line */}
        <Animated.View style={[st.voiceBox, { opacity: fadeAnim }]}>
          <Text style={st.voiceLine}>{VOICE_LINES[voiceIndex]}</Text>
        </Animated.View>
      </View>

      {/* Live metrics */}
      <View style={st.metrics}>
        <View style={st.metric}>
          <Text style={st.metricVal}>{targetSpot.distance}</Text>
          <Text style={st.metricLabel}>Distance</Text>
        </View>
        <View style={st.metricDiv} />
        <View style={st.metric}>
          <Text style={st.metricVal}>{formatTime(elapsed)}</Text>
          <Text style={st.metricLabel}>Session</Text>
        </View>
        <View style={st.metricDiv} />
        <View style={st.metric}>
          <Text style={st.metricVal}>₹{activeBooking?.amountPaid ?? targetSpot.dynamicPrice}</Text>
          <Text style={st.metricLabel}>Booked for</Text>
        </View>
        <View style={st.metricDiv} />
        <View style={st.metric}>
          <Text style={st.metricVal}>₹{walletBalance}</Text>
          <Text style={st.metricLabel}>Wallet</Text>
        </View>
      </View>

      {/* Feature pills */}
      <View style={st.pills}>
        <View style={st.pill}>
          <Shield size={12} color={COLORS.success} />
          <Text style={st.pillText}>{targetSpot.confidence} Confidence</Text>
        </View>
        {targetSpot.hasEV && (
          <View style={[st.pill, { borderColor: COLORS.success + '50' }]}>
            <Zap size={12} color={COLORS.success} />
            <Text style={[st.pillText, { color: COLORS.success }]}>EV Ready</Text>
          </View>
        )}
        <View style={st.pill}>
          <Text style={st.pillText}>🏙 {targetSpot.city ?? 'India'}</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={st.bottomActions}>
        <TouchableOpacity style={st.navBtn} onPress={handleNavigate}>
          <Navigation2 size={20} color="#fff" />
          <Text style={st.navBtnText}>Open Maps</Text>
        </TouchableOpacity>
        <TouchableOpacity style={st.checkoutBtn} onPress={handleCheckout}>
          <CheckCircle2 size={20} color="#fff" />
          <Text style={st.checkoutBtnText}>Geo-Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#07071A' },

  closeBtn: {
    position: 'absolute', top: 52, right: 20, zIndex: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 54,
    paddingHorizontal: 20, paddingBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  topLeft: { flex: 1, paddingRight: 12 },
  topLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  topTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2 },
  topAddr: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  topAddrText: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  etaBox: {
    backgroundColor: COLORS.primary + '25', borderWidth: 1, borderColor: COLORS.primary + '60',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center',
  },
  etaVal: { color: COLORS.primary, fontSize: 18, fontWeight: '900' },
  etaLabel: { color: COLORS.primary + 'AA', fontSize: 9, marginTop: 2, fontWeight: '600' },

  orbSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  ring: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 2, borderColor: COLORS.primary,
  },
  orb: {
    width: 170, height: 170, borderRadius: 85,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 50, elevation: 30,
    marginBottom: 24,
  },
  modeTitle: { color: '#fff', fontSize: 20, fontWeight: '300', letterSpacing: 2, marginBottom: 6 },
  modeSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 0.5, marginBottom: 20 },
  voiceBox: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 20, paddingVertical: 14,
  },
  voiceLine: {
    color: COLORS.primaryLight, fontSize: 15, fontWeight: '500',
    fontStyle: 'italic', textAlign: 'center', lineHeight: 22,
  },

  metrics: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 16,
  },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  metricLabel: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 4, fontWeight: '600', textTransform: 'uppercase' },
  metricDiv: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },

  pills: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  pillText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },

  bottomActions: {
    flexDirection: 'row', padding: 16, paddingBottom: 36, gap: 12,
  },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)', padding: 16, borderRadius: 18,
  },
  navBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  checkoutBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.success, padding: 16, borderRadius: 18,
  },
  checkoutBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

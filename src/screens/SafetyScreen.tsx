import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Animated, Vibration, Linking,
} from 'react-native';
import {
  ShieldAlert, MapPin, AlertTriangle, Phone, UserCheck,
  Navigation2, Bell, Shield, CheckCircle2, X,
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

type SafeZone = { id: string; name: string; address: string; lit: boolean; cctv: boolean; distance: string };

const SAFE_ZONES: SafeZone[] = [
  { id: 'sz1', name: 'Sector 17 Police Station', address: 'Sector 17-E, Chandigarh', lit: true, cctv: true, distance: '0.3 km' },
  { id: 'sz2', name: 'BKC Smart Parking Hub', address: 'Bandra East, Mumbai', lit: true, cctv: true, distance: '0.2 km' },
  { id: 'sz3', name: 'Elante Safe Drop-off', address: 'Industrial Area, Chandigarh', lit: true, cctv: true, distance: '0.6 km' },
  { id: 'sz4', name: 'Andheri West Security Post', address: 'Near Station, Mumbai', lit: true, cctv: true, distance: '1.0 km' },
];

const EMERGENCY_NUMBERS = [
  { label: 'Police', number: '100', icon: '🚓' },
  { label: 'Ambulance', number: '108', icon: '🚑' },
  { label: 'Fire', number: '101', icon: '🚒' },
  { label: 'Women Helpline', number: '181', icon: '👩‍⚕️' },
];

export default function SafetyScreen() {
  const { emergencyContact, emergencyContactName, updateProfile } = useApp();
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [newContact, setNewContact] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [selectedZone, setSelectedZone] = useState<SafeZone | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // SOS countdown
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (sosActive && sosCountdown > 0) {
      Vibration.vibrate(200);
      timer = setInterval(() => setSosCountdown(c => c - 1), 1000);
    }
    if (sosActive && sosCountdown === 0) {
      // Simulate SOS sent
      setSosActive(false);
      setSosCountdown(5);
      Vibration.cancel();
      Alert.alert(
        '🚨 SOS Sent!',
        `Emergency alert sent to:\n• ${emergencyContactName} (${emergencyContact})\n• Campus Security: +91-9876500099\n\nHelp is on the way. Stay calm.`,
        [{ text: 'OK' }],
      );
    }
    return () => clearInterval(timer);
  }, [sosActive, sosCountdown]);

  // Pulse animation for SOS
  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sosActive]);

  const handleSOS = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS',
      'This will send your live location to your emergency contact and campus security. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'SEND SOS NOW', style: 'destructive',
          onPress: () => { setSosActive(true); setSosCountdown(5); },
        },
      ],
    );
  };

  const handleCancelSOS = () => {
    setSosActive(false);
    setSosCountdown(5);
    Vibration.cancel();
  };

  const handleShare = () => {
    setSharingLocation(v => !v);
    if (!sharingLocation) {
      Alert.alert(
        'Location Sharing Active',
        `Your live location is now being shared with ${emergencyContactName}. They can track you in real time.`,
      );
    } else {
      Alert.alert('Location Sharing Stopped', 'Your location is no longer being shared.');
    }
  };

  const handleCallEmergency = (number: string, label: string) => {
    Alert.alert(`Call ${label}?`, `Dial ${number}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: `Call ${number}`, onPress: () => Linking.openURL(`tel:${number}`) },
    ]);
  };

  const handleCallContact = () => {
    Alert.alert(`Call ${emergencyContactName}?`, `Dial ${emergencyContact}`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: () => Linking.openURL(`tel:${emergencyContact.replace(/[^+\d]/g, '')}`) },
    ]);
  };

  const handleSaveContact = () => {
    if (!newContact || !newContactName) {
      Alert.alert('Missing Info', 'Enter both name and phone number.');
      return;
    }
    updateProfile({ emergencyContact: newContact, emergencyContactName: newContactName });
    setContactModal(false);
    setNewContact('');
    setNewContactName('');
    Alert.alert('Contact Updated', 'Emergency contact saved successfully.');
  };

  const openSafeZone = (zone: SafeZone) => {
    const url = `https://maps.google.com/?q=${zone.name}+JMIT+Campus`;
    Alert.alert(
      zone.name,
      `${zone.address}\n\n📍 ${zone.distance} away\n💡 Well-lit: ${zone.lit ? 'Yes' : 'No'}\n📹 CCTV: ${zone.cctv ? 'Yes' : 'No'}`,
      [
        { text: 'Navigate There', onPress: () => Linking.openURL(url) },
        { text: 'Close', style: 'cancel' },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Shield size={28} color={COLORS.primary} />
        <View style={{ marginLeft: SIZES.md }}>
          <Text style={styles.title}>Safety Center</Text>
          <Text style={styles.subtitle}>Campus-aware security features</Text>
        </View>
      </View>

      {/* SOS Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.sosButton, sosActive && styles.sosButtonActive]}
          onPress={sosActive ? handleCancelSOS : handleSOS}
          activeOpacity={0.8}
        >
          <AlertTriangle size={32} color={COLORS.surface} />
          <View style={styles.sosTextContainer}>
            {sosActive ? (
              <>
                <Text style={styles.sosTitle}>SENDING SOS IN {sosCountdown}s</Text>
                <Text style={styles.sosSub}>Tap to cancel</Text>
              </>
            ) : (
              <>
                <Text style={styles.sosTitle}>SOS Emergency</Text>
                <Text style={styles.sosSub}>Hold to send location alert</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Location Sharing */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Navigation2 color={sharingLocation ? COLORS.success : COLORS.primary} size={22} />
          <Text style={styles.cardTitle}>Live Location Sharing</Text>
          {sharingLocation && <View style={styles.activePill}><Text style={styles.activePillText}>ACTIVE</Text></View>}
        </View>
        <Text style={styles.cardText}>
          Share your real-time location with {emergencyContactName}. They can monitor your walk to your car.
        </Text>
        <TouchableOpacity
          style={[styles.btn, sharingLocation && styles.btnDanger]}
          onPress={handleShare}
        >
          <Text style={styles.btnText}>{sharingLocation ? 'Stop Sharing' : 'Start Sharing Location'}</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Contact */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <UserCheck color={COLORS.success} size={22} />
          <Text style={styles.cardTitle}>Emergency Contact</Text>
        </View>
        <View style={styles.contactRow}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactInitial}>{emergencyContactName[0]}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{emergencyContactName}</Text>
            <Text style={styles.contactPhone}>{emergencyContact}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={handleCallContact}>
            <Phone size={16} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.btn, { marginTop: SIZES.sm }]} onPress={() => setContactModal(true)}>
          <Text style={styles.btnText}>Edit Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Numbers */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Phone color={COLORS.danger} size={22} />
          <Text style={styles.cardTitle}>Quick Emergency Dial</Text>
        </View>
        <View style={styles.emergencyGrid}>
          {EMERGENCY_NUMBERS.map(n => (
            <TouchableOpacity
              key={n.number}
              style={styles.emergencyBtn}
              onPress={() => handleCallEmergency(n.number, n.label)}
            >
              <Text style={styles.emergencyIcon}>{n.icon}</Text>
              <Text style={styles.emergencyLabel}>{n.label}</Text>
              <Text style={styles.emergencyNumber}>{n.number}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Safe Parking Zones */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MapPin color={COLORS.success} size={22} />
          <Text style={styles.cardTitle}>Safe Parking Zones</Text>
        </View>
        <Text style={styles.cardText}>
          Well-lit and CCTV-monitored zones verified by campus security.
        </Text>
        {SAFE_ZONES.map(zone => (
          <TouchableOpacity
            key={zone.id}
            style={styles.zoneRow}
            onPress={() => openSafeZone(zone)}
          >
            <View style={[styles.zoneDot, { backgroundColor: zone.cctv && zone.lit ? COLORS.success : zone.lit ? COLORS.warning : COLORS.danger }]} />
            <View style={styles.zoneInfo}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <Text style={styles.zoneAddress} numberOfLines={1}>{zone.address}</Text>
            </View>
            <View style={styles.zoneMeta}>
              {zone.cctv && <Text style={styles.zoneTag}>📹</Text>}
              {zone.lit && <Text style={styles.zoneTag}>💡</Text>}
              <Text style={styles.zoneDistance}>{zone.distance}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Safety Tips */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <View style={styles.cardHeader}>
          <Bell color={COLORS.warning} size={22} />
          <Text style={styles.cardTitle}>Safety Tips</Text>
        </View>
        {[
          'Always park in well-lit, high-footfall areas.',
          'Share your live location before walking to your car at night.',
          'Phantom spots (purple) are unverified — approach with caution.',
          'Report suspicious activity via the SOS button.',
          'EV Hub zones have 24/7 CCTV and are the safest.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <CheckCircle2 size={16} color={COLORS.success} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Edit Contact Modal */}
      <Modal visible={contactModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={newContactName}
              onChangeText={setNewContactName}
              placeholderTextColor={COLORS.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (e.g. +91-9876543210)"
              value={newContact}
              onChangeText={setNewContact}
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveContact}>
              <Text style={styles.submitBtnText}>Save Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setContactModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: SIZES.xl,
    paddingTop: 54, backgroundColor: COLORS.surface, ...SHADOWS.card,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  sosButton: {
    margin: SIZES.md, backgroundColor: COLORS.danger, borderRadius: 20,
    padding: SIZES.xl, alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 14, ...SHADOWS.floating,
  },
  sosButtonActive: { backgroundColor: '#C0392B' },
  sosTextContainer: { alignItems: 'flex-start' },
  sosTitle: { color: COLORS.surface, fontSize: 18, fontWeight: 'bold' },
  sosSub: { color: COLORS.surface + 'CC', fontSize: 12, marginTop: 2 },
  card: {
    margin: SIZES.md, backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius, padding: SIZES.lg, ...SHADOWS.card,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  activePill: { backgroundColor: COLORS.success + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  activePillText: { color: COLORS.success, fontSize: 10, fontWeight: '700' },
  cardText: { color: COLORS.textSecondary, lineHeight: 20, marginBottom: SIZES.md, fontSize: 13 },
  btn: { backgroundColor: COLORS.primary, padding: SIZES.md, borderRadius: 14, alignItems: 'center' },
  btnDanger: { backgroundColor: COLORS.danger },
  btnText: { color: COLORS.surface, fontWeight: '700', fontSize: 14 },
  contactRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background,
    borderRadius: 14, padding: SIZES.md, marginBottom: SIZES.sm,
  },
  contactAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  contactInitial: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
  contactInfo: { flex: 1, marginLeft: SIZES.md },
  contactName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  contactPhone: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  callBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center',
  },
  emergencyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  emergencyBtn: {
    width: '47%', backgroundColor: COLORS.background,
    borderRadius: 14, padding: SIZES.md, alignItems: 'center',
  },
  emergencyIcon: { fontSize: 24, marginBottom: 4 },
  emergencyLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  emergencyNumber: { fontSize: 16, fontWeight: 'bold', color: COLORS.danger, marginTop: 2 },
  zoneRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  zoneDot: { width: 10, height: 10, borderRadius: 5, marginRight: SIZES.sm },
  zoneInfo: { flex: 1 },
  zoneName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  zoneAddress: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  zoneMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  zoneTag: { fontSize: 14 },
  zoneDistance: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  tipText: { fontSize: 13, color: COLORS.text, flex: 1, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.xl, paddingBottom: 36,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.lg },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: SIZES.md, marginBottom: SIZES.sm, color: COLORS.text, fontSize: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.md + 2, borderRadius: 16,
    alignItems: 'center', marginTop: SIZES.sm, marginBottom: SIZES.md,
  },
  submitBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 15 },
  cancelText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14 },
});

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Switch,
} from 'react-native';
import {
  User, Shield, Target, Car, Wallet, Star,
  Settings, ChevronRight, Bell, LogOut, Edit2, CheckCircle2,
  TrendingUp, Zap, Clock,
} from 'lucide-react-native';
import { currentUser } from '../utils/mockData';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';

type VehicleType = 'Car' | 'Bike' | 'EV';

const ACHIEVEMENTS = [
  { id: 'a1', title: 'First Park', desc: 'Completed first booking', icon: '🅿️', earned: true },
  { id: 'a2', title: 'Phantom Hunter', desc: 'Reported 5 phantom spots', icon: '👻', earned: true },
  { id: 'a3', title: 'Trust Elite', desc: 'Reached 95+ trust score', icon: '🏆', earned: true },
  { id: 'a4', title: 'EV Champion', desc: 'Used EV charging 10 times', icon: '⚡', earned: false },
  { id: 'a5', title: 'Community Hero', desc: 'Verified 50 spots', icon: '🦸', earned: false },
  { id: 'a6', title: 'Saver Pro', desc: 'Saved ₹1000 using predictions', icon: '💰', earned: false },
];

export default function ProfileScreen() {
  const { walletBalance, bookings, listedSpots, vehicleNumber, updateProfile } = useApp();
  const [editModal, setEditModal] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState(vehicleNumber);
  const [newVehicleType, setNewVehicleType] = useState<VehicleType>(currentUser.vehicleType);
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifPhantom, setNotifPhantom] = useState(true);
  const [notifOffers, setNotifOffers] = useState(false);

  const completedBookings = bookings.filter(b => b.status === 'Completed').length;
  const totalSpent = bookings.reduce((s, b) => s + (b.status !== 'Cancelled' ? b.amountPaid : 0), 0);

  const trustColor = currentUser.trustScore >= 90
    ? COLORS.success
    : currentUser.trustScore >= 70
    ? COLORS.warning
    : COLORS.danger;

  const handleSaveProfile = () => {
    if (!newVehicle.trim()) {
      Alert.alert('Required', 'Vehicle number cannot be empty.');
      return;
    }
    updateProfile({ vehicleNumber: newVehicle.trim() });
    setEditModal(false);
    Alert.alert('Profile Updated', 'Your vehicle details have been saved.');
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => Alert.alert('Logged out', 'Demo mode — login screen would appear here.') },
    ]);
  };

  const StatBox = ({ value, label, color }: { value: string | number; label: string; color?: string }) => (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color: color ?? COLORS.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <User color={COLORS.primary} size={44} />
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} onPress={() => setEditModal(true)}>
            <Edit2 size={14} color={COLORS.surface} />
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.roll}>Vehicle: {vehicleNumber}</Text>
        <View style={{ height: 10 }} />


        <TouchableOpacity style={styles.settingsBtn} onPress={() => setSettingsModal(true)}>
          <Settings size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Trust Score */}
      <View style={[styles.trustCard, { borderColor: trustColor + '40' }]}>
        <View style={styles.trustLeft}>
          <Text style={styles.trustLabel}>Community Trust Level</Text>
          <Text style={[styles.trustValue, { color: trustColor }]}>{currentUser.trustScore}/100</Text>
          <Text style={styles.trustSub}>Verified Elite Contributor</Text>
          <View style={styles.trustBar}>
            <View style={[styles.trustFill, { width: `${currentUser.trustScore}%`, backgroundColor: trustColor }]} />
          </View>
        </View>
        <View style={[styles.trustBadge, { backgroundColor: trustColor + '10' }]}>
          <Shield color={trustColor} size={28} />
        </View>
      </View>

      {/* Parking Insights */}
      <View style={styles.insightsCard}>
         <View style={styles.insightsHeader}>
            <TrendingUp size={18} color={COLORS.primary} />
            <Text style={styles.insightsTitle}>Parking Insights (Last 30 Days)</Text>
         </View>
         
         <View style={styles.graphContainer}>
            {/* Mock Graph Bars */}
            {[45, 60, 35, 80, 55, 90, 75].map((h, i) => (
              <View key={i} style={styles.graphColumn}>
                 <View style={[styles.graphBar, { height: h, backgroundColor: i === 5 ? COLORS.primary : COLORS.primaryLight }]} />
                 <Text style={styles.graphDay}>{['M','T','W','T','F','S','S'][i]}</Text>
              </View>
            ))}
         </View>

         <View style={styles.ecoRow}>
            <View style={styles.ecoItem}>
               <View style={[styles.ecoIcon, { backgroundColor: '#E8F8F0' }]}>
                  <Zap size={16} color={COLORS.success} />
               </View>
               <View>
                  <Text style={styles.ecoVal}>12.4 kg</Text>
                  <Text style={styles.ecoLabel}>CO2 Saved</Text>
               </View>
            </View>
            <View style={styles.ecoItem}>
               <View style={[styles.ecoIcon, { backgroundColor: '#FEF9E7' }]}>
                  <Clock size={16} color={COLORS.warning} />
               </View>
               <View>
                  <Text style={styles.ecoVal}>8.5 hrs</Text>
                  <Text style={styles.ecoLabel}>Time Saved</Text>
               </View>
            </View>
         </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Your Stats</Text>
      <View style={styles.statsGrid}>
        <StatBox value={bookings.length} label="Total Bookings" />
        <StatBox value={completedBookings} label="Completed" color={COLORS.success} />
        <StatBox value={`₹${totalSpent}`} label="Total Spent" color={COLORS.warning} />
        <StatBox value={`₹${walletBalance}`} label="Wallet" color={COLORS.primary} />
        <StatBox value={currentUser.spotsVerified} label="Spots Verified" color={COLORS.success} />
        <StatBox value={currentUser.phantomSpotsOverridden} label="Phantom Caught" color={COLORS.phantom} />
        <StatBox value={listedSpots.length} label="Spots Listed" color={COLORS.primary} />
        <StatBox value={`₹${currentUser.moneySaved}`} label="Money Saved" color={COLORS.success} />
      </View>

      {/* Anti-Mafia Dashboard */}
      <Text style={styles.sectionTitle}>Anti-Mafia Dashboard</Text>
      <View style={styles.mafiaDash}>
        <View style={styles.mafiaItem}>
          <Shield size={28} color={COLORS.success} />
          <Text style={styles.mafiaVal}>{currentUser.spotsVerified}</Text>
          <Text style={styles.mafiaLabel}>Community Spots Verified</Text>
        </View>
        <View style={styles.mafiaDiv} />
        <View style={styles.mafiaItem}>
          <Target size={28} color={COLORS.phantom} />
          <Text style={styles.mafiaVal}>{currentUser.phantomSpotsOverridden}</Text>
          <Text style={styles.mafiaLabel}>Phantom Spots Flagged</Text>
        </View>
        <View style={styles.mafiaDiv} />
        <View style={styles.mafiaItem}>
          <Star size={28} color={COLORS.warning} />
          <Text style={styles.mafiaVal}>4.8</Text>
          <Text style={styles.mafiaLabel}>Avg. Spot Rating</Text>
        </View>
      </View>

      {/* Achievements */}
      <Text style={styles.sectionTitle}>Achievements</Text>
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS.map(a => (
          <View key={a.id} style={[styles.achievementCard, !a.earned && styles.achievementLocked]}>
            <Text style={styles.achievementIcon}>{a.icon}</Text>
            <Text style={[styles.achievementTitle, !a.earned && styles.lockedText]}>{a.title}</Text>
            <Text style={[styles.achievementDesc, !a.earned && styles.lockedText]}>{a.desc}</Text>
            {a.earned && <CheckCircle2 size={14} color={COLORS.success} style={{ marginTop: 4 }} />}
            {!a.earned && <Text style={styles.lockedLabel}>Locked</Text>}
          </View>
        ))}
      </View>

      {/* Menu */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.menuCard}>
        {[
          { icon: <Wallet size={18} color={COLORS.primary} />, label: 'Wallet Balance', val: `₹${walletBalance}` },
          { icon: <Car size={18} color={COLORS.primary} />, label: 'Vehicle', val: vehicleNumber },
          { icon: <Bell size={18} color={COLORS.primary} />, label: 'Notifications', val: 'Configured' },
          { icon: <Shield size={18} color={COLORS.success} />, label: 'Account Status', val: 'Verified' },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.menuRow, i < 3 && { borderBottomWidth: 1, borderBottomColor: COLORS.border }]}
            onPress={() => i === 0 ? null : i === 1 ? setEditModal(true) : i === 2 ? setSettingsModal(true) : null}
          >
            <View style={styles.menuIcon}>{item.icon}</View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuVal}>{item.val}</Text>
            <ChevronRight size={16} color={COLORS.border} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut size={18} color={COLORS.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Vehicle Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number (e.g. UK07-AB-1234)"
              value={newVehicle}
              onChangeText={setNewVehicle}
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="characters"
            />
            <Text style={styles.inputLabel}>Vehicle Type</Text>
            <View style={styles.typeRow}>
              {(['Car', 'Bike', 'EV'] as VehicleType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeChip, newVehicleType === t && styles.typeChipActive]}
                  onPress={() => setNewVehicleType(t)}
                >
                  <Text style={[styles.typeChipText, newVehicleType === t && styles.typeChipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSaveProfile}>
              <Text style={styles.submitBtnText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal visible={settingsModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: 36 }]}>
            <Text style={styles.modalTitle}>Notification Settings</Text>
            {[
              { label: 'Booking Reminders', state: notifBooking, set: setNotifBooking },
              { label: 'Phantom Spot Alerts', state: notifPhantom, set: setNotifPhantom },
              { label: 'Promotional Offers', state: notifOffers, set: setNotifOffers },
            ].map((item, i) => (
              <View key={i} style={styles.toggleRow}>
                <Bell size={16} color={COLORS.primary} />
                <Text style={styles.toggleLabel}>{item.label}</Text>
                <Switch
                  value={item.state}
                  onValueChange={item.set}
                  trackColor={{ true: COLORS.primary }}
                  thumbColor={COLORS.surface}
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => { setSettingsModal(false); Alert.alert('Settings Saved', 'Your preferences have been updated.'); }}
            >
              <Text style={styles.submitBtnText}>Save Settings</Text>
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
    alignItems: 'center', padding: SIZES.xl, paddingTop: 54,
    backgroundColor: COLORS.surface, ...SHADOWS.card, position: 'relative',
  },
  avatarWrap: { position: 'relative', marginBottom: SIZES.md },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center',
  },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  roll: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  vehicleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginTop: 10,
  },
  vehicleBadgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  settingsBtn: { position: 'absolute', top: 54, right: 20 },
  trustCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    margin: SIZES.md, backgroundColor: COLORS.surface, borderRadius: 20,
    padding: SIZES.lg, borderWidth: 2, ...SHADOWS.card,
  },
  trustBadge: {
    width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },

  insightsCard: {
    backgroundColor: COLORS.surface, margin: SIZES.lg,
    marginTop: 0, padding: SIZES.lg, borderRadius: 24, ...SHADOWS.card,
  },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  insightsTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  graphContainer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    height: 100, marginBottom: 25, paddingHorizontal: 10,
  },
  graphColumn: { alignItems: 'center', gap: 8 },
  graphBar: { width: 28, borderRadius: 8 },
  graphDay: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700' },
  ecoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  ecoItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.background, padding: 12, borderRadius: 16,
  },
  ecoIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ecoVal: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  ecoLabel: { fontSize: 10, color: COLORS.textSecondary },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: SIZES.lg,
    marginBottom: SIZES.xl, backgroundColor: COLORS.surface, padding: SIZES.lg,
    borderRadius: 24, ...SHADOWS.card,
  },
  trustLeft: { flex: 1 },
  trustLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  trustValue: { fontSize: 48, fontWeight: 'bold' },
  trustSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  trustBar: {
    height: 6, backgroundColor: COLORS.border, borderRadius: 3,
    marginTop: SIZES.sm, overflow: 'hidden',
  },
  trustFill: { height: 6, borderRadius: 3 },
  sectionTitle: {
    marginHorizontal: SIZES.md, marginTop: SIZES.lg,
    fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.sm,
  },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.md, gap: 10,
  },
  statBox: {
    width: '22%', flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: SIZES.sm, alignItems: 'center', ...SHADOWS.card,
  },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  mafiaDash: {
    flexDirection: 'row', margin: SIZES.md, backgroundColor: COLORS.surface,
    borderRadius: 16, padding: SIZES.md, ...SHADOWS.card, alignItems: 'center',
  },
  mafiaItem: { flex: 1, alignItems: 'center', gap: 4 },
  mafiaDiv: { width: 1, height: 50, backgroundColor: COLORS.border },
  mafiaVal: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  mafiaLabel: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center' },
  achievementsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: SIZES.md, gap: 10,
  },
  achievementCard: {
    width: '30%', flex: 1, backgroundColor: COLORS.surface, borderRadius: 14,
    padding: SIZES.sm, alignItems: 'center', ...SHADOWS.card,
  },
  achievementLocked: { opacity: 0.5 },
  achievementIcon: { fontSize: 28 },
  achievementTitle: { fontSize: 11, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginTop: 4 },
  achievementDesc: { fontSize: 9, color: COLORS.textSecondary, textAlign: 'center', marginTop: 2 },
  lockedText: { color: COLORS.textSecondary },
  lockedLabel: { fontSize: 9, color: COLORS.textSecondary, fontStyle: 'italic', marginTop: 2 },
  menuCard: {
    margin: SIZES.md, backgroundColor: COLORS.surface,
    borderRadius: 16, overflow: 'hidden', ...SHADOWS.card,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: 12 },
  menuIcon: { width: 32, alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  menuVal: { fontSize: 13, color: COLORS.textSecondary },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, margin: SIZES.md, marginBottom: 36, padding: SIZES.md,
    backgroundColor: COLORS.danger + '15', borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.danger + '30',
  },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.xl,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.lg },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: SIZES.md, marginBottom: SIZES.sm, color: COLORS.text, fontSize: 14,
  },
  inputLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.xs },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: SIZES.md },
  typeChip: {
    flex: 1, padding: 10, borderRadius: 12, borderWidth: 1.5,
    borderColor: COLORS.border, alignItems: 'center',
  },
  typeChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  typeChipText: { fontWeight: '700', color: COLORS.textSecondary },
  typeChipTextActive: { color: COLORS.primary },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  toggleLabel: { flex: 1, fontSize: 14, color: COLORS.text },
  submitBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.md + 2, borderRadius: 16,
    alignItems: 'center', marginTop: SIZES.md, marginBottom: SIZES.sm,
  },
  submitBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 15 },
  cancelText: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, padding: SIZES.sm },
});

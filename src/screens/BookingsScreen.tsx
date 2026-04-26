import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, Switch,
} from 'react-native';
import { Clock, CheckCircle2, XCircle, PlusCircle, Trash2, MapPin, Zap, X } from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Booking, ListedSpot } from '../types';

type SpotType = 'Car' | 'Bike' | 'EV';

export default function BookingsScreen() {
  const { bookings, cancelBooking, listedSpots, addListedSpot, removeListedSpot, walletBalance, addWallet } = useApp();
  const [tab, setTab] = useState<'bookings' | 'listed'>('bookings');
  const [listModal, setListModal] = useState(false);
  const [walletModal, setWalletModal] = useState(false);
  const [bookingDetailModal, setBookingDetailModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [addAmount, setAddAmount] = useState('');

  // Form state for listing a spot
  const [form, setForm] = useState({
    title: '',
    address: '',
    type: 'Car' as SpotType,
    price: '',
    openHours: '',
    totalSpots: '',
    features: { cctv: false, covered: false, evCharging: false, security: false },
  });

  const activeBookings = bookings.filter(b => b.status === 'Active');
  const pastBookings = bookings.filter(b => b.status !== 'Active');

  const handleCancelBooking = (b: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Cancel booking at ${b.spotTitle}?`,
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive',
          onPress: () => cancelBooking(b.id),
        },
      ],
    );
  };

  const handleListSpot = () => {
    if (!form.title || !form.address || !form.price || !form.openHours || !form.totalSpots) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }
    const featList: string[] = [];
    if (form.features.cctv) featList.push('CCTV');
    if (form.features.covered) featList.push('Covered');
    if (form.features.evCharging) featList.push('EV Charging');
    if (form.features.security) featList.push('Security Guard');

    const newSpot: ListedSpot = {
      id: `ls-${Date.now()}`,
      title: form.title,
      address: form.address,
      type: form.type,
      price: Number(form.price),
      openHours: form.openHours,
      totalSpots: Number(form.totalSpots),
      availableSpots: Number(form.totalSpots),
      latitude: 30.0298 + (Math.random() - 0.5) * 0.01,
      longitude: 77.0498 + (Math.random() - 0.5) * 0.01,
      features: featList,
      ownerName: 'Prisha Sharma',
    };

    addListedSpot(newSpot);
    setListModal(false);
    setForm({
      title: '', address: '', type: 'Car', price: '', openHours: '',
      totalSpots: '', features: { cctv: false, covered: false, evCharging: false, security: false },
    });
    Alert.alert('Spot Listed! 🎉', 'Your parking spot is now live on the network. You will be notified when someone books it.');
  };

  const handleAddWallet = () => {
    const amt = Number(addAmount);
    if (!amt || amt < 10) { Alert.alert('Invalid Amount', 'Enter at least ₹10.'); return; }
    addWallet(amt);
    setAddAmount('');
    setWalletModal(false);
    Alert.alert('Wallet Updated', `₹${amt} added to your wallet.`);
  };

  const renderBookingCard = (b: Booking) => {
    const isActive = b.status === 'Active';
    const borderColor = isActive ? COLORS.primary : b.status === 'Completed' ? COLORS.success : COLORS.danger;
    return (
      <TouchableOpacity 
        key={b.id} 
        activeOpacity={0.8}
        onPress={() => {
          setSelectedBooking(b);
          setBookingDetailModal(true);
        }}
        style={[styles.bookingCard, { borderLeftColor: borderColor }]}
      >
        <View style={styles.bookingHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bookingTitle} numberOfLines={1}>{b.spotTitle}</Text>
            <View style={styles.addressRow}>
              <MapPin size={11} color={COLORS.textSecondary} />
              <Text style={styles.bookingAddress} numberOfLines={1}>{b.address}</Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: borderColor + '20' }]}>
            <Text style={[styles.badgeText, { color: borderColor }]}>{b.status}</Text>
          </View>
        </View>

        <View style={styles.bookingMeta}>
          <Text style={styles.metaText}>📅 {b.date}</Text>
          <Text style={styles.metaText}>⏱ {b.startTime}{b.endTime ? ` – ${b.endTime}` : ' (Ongoing)'}</Text>
          {b.duration && <Text style={styles.metaText}>🕒 {b.duration}</Text>}
        </View>

        <View style={styles.bookingFooter}>
          <Text style={styles.amountText}>₹{b.amountPaid} paid</Text>
          <Text style={styles.vehicleText}>🚗 {b.vehicleNumber}</Text>
          {isActive && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancelBooking(b)}>
              <XCircle size={14} color={COLORS.danger} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Wallet top bar */}
      <View style={styles.walletBar}>
        <View>
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmt}>₹{walletBalance}</Text>
        </View>
        <TouchableOpacity style={styles.addFundsBtn} onPress={() => setWalletModal(true)}>
          <PlusCircle size={16} color={COLORS.surface} />
          <Text style={styles.addFundsText}>Add Funds</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'bookings' && styles.tabBtnActive]}
          onPress={() => setTab('bookings')}
        >
          <Text style={[styles.tabText, tab === 'bookings' && styles.tabTextActive]}>My Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'listed' && styles.tabBtnActive]}
          onPress={() => setTab('listed')}
        >
          <Text style={[styles.tabText, tab === 'listed' && styles.tabTextActive]}>My Listed Spots</Text>
        </TouchableOpacity>
      </View>

      {tab === 'bookings' ? (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {activeBookings.length > 0 && (
            <>
              <Text style={styles.sectionHead}>🟢 Active</Text>
              {activeBookings.map(renderBookingCard)}
            </>
          )}
          {pastBookings.length > 0 && (
            <>
              <Text style={styles.sectionHead}>History</Text>
              {pastBookings.map(renderBookingCard)}
            </>
          )}
          {bookings.length === 0 && (
            <View style={styles.emptyState}>
              <Clock size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No bookings yet</Text>
              <Text style={styles.emptySubText}>Book a spot on the Explore tab</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.listSpotBtn} onPress={() => setListModal(true)}>
            <PlusCircle size={20} color={COLORS.surface} />
            <Text style={styles.listSpotBtnText}>+ List My Parking Spot</Text>
          </TouchableOpacity>

          {listedSpots.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No spots listed yet</Text>
              <Text style={styles.emptySubText}>List your spot and earn money!</Text>
            </View>
          ) : (
            listedSpots.map(s => (
              <View key={s.id} style={styles.listedCard}>
                <View style={styles.listedHeader}>
                  <View>
                    <Text style={styles.listedTitle}>{s.title}</Text>
                    <Text style={styles.listedAddress} numberOfLines={1}>{s.address}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => Alert.alert('Remove Spot', 'Remove this listing?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => removeListedSpot(s.id) },
                    ])}
                  >
                    <Trash2 size={16} color={COLORS.danger} />
                  </TouchableOpacity>
                </View>
                <View style={styles.listedMeta}>
                  <Text style={styles.metaChip}>🚗 {s.type}</Text>
                  <Text style={styles.metaChip}>₹{s.price}/hr</Text>
                  <Text style={styles.metaChip}>🕒 {s.openHours}</Text>
                </View>
                <View style={styles.listedMeta}>
                  {s.features.map(f => (
                    <Text key={f} style={[styles.metaChip, { backgroundColor: '#E8F8F0', color: COLORS.success }]}>{f}</Text>
                  ))}
                </View>
                <View style={styles.spotsAvail}>
                  <Text style={styles.spotsAvailText}>{s.availableSpots}/{s.totalSpots} spots available</Text>
                  <View style={styles.liveIndicator}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Booking Detail Modal */}
      <Modal visible={bookingDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: 36 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
               <Text style={styles.modalTitle}>Booking Details</Text>
               <TouchableOpacity onPress={() => setBookingDetailModal(false)}>
                  <X size={24} color={COLORS.textSecondary} />
               </TouchableOpacity>
            </View>
            
            {selectedBooking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: COLORS.text, flex: 1 }}>{selectedBooking.spotTitle}</Text>
                    <View style={[styles.badge, { 
                      backgroundColor: (selectedBooking.status === 'Active' ? COLORS.primary : selectedBooking.status === 'Completed' ? COLORS.success : COLORS.danger) + '20' 
                    }]}>
                      <Text style={[styles.badgeText, { 
                        color: selectedBooking.status === 'Active' ? COLORS.primary : selectedBooking.status === 'Completed' ? COLORS.success : COLORS.danger 
                      }]}>{selectedBooking.status}</Text>
                    </View>
                  </View>
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 }}>
                    <MapPin size={14} color={COLORS.textSecondary} />
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, flex: 1 }}>{selectedBooking.address}</Text>
                  </View>
                  
                  <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 15 }} />
                  
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15 }}>
                    <View style={{ width: '45%' }}>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>Date</Text>
                      <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: '700', marginTop: 2 }}>{selectedBooking.date}</Text>
                    </View>
                    <View style={{ width: '45%' }}>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>Time</Text>
                      <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: '700', marginTop: 2 }}>{selectedBooking.startTime}{selectedBooking.endTime ? ` – ${selectedBooking.endTime}` : ' (Ongoing)'}</Text>
                    </View>
                    <View style={{ width: '45%' }}>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>Duration</Text>
                      <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: '700', marginTop: 2 }}>{selectedBooking.duration || 'N/A'}</Text>
                    </View>
                    <View style={{ width: '45%' }}>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' }}>Vehicle</Text>
                      <Text style={{ fontSize: 14, color: COLORS.text, fontWeight: '700', marginTop: 2 }}>{selectedBooking.vehicleNumber}</Text>
                    </View>
                  </View>
                  
                  <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 15 }} />
                  
                  <View style={{ backgroundColor: COLORS.background, padding: 15, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.text, marginBottom: 10 }}>Payment Information</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                       <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>Amount Paid</Text>
                       <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.text }}>₹{selectedBooking.amountPaid}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                       <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>Method</Text>
                       <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.text }}>{selectedBooking.paymentMethod || 'Wallet'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                       <Text style={{ fontSize: 13, color: COLORS.textSecondary }}>Transaction ID</Text>
                       <Text style={{ fontSize: 12, fontWeight: '800', color: COLORS.primary, fontFamily: 'monospace' }}>{selectedBooking.transactionId || 'TXN-' + Math.floor(Math.random()*100000000)}</Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 20, padding: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.text }}>Need Help?</Text>
                    <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 4 }}>If you have issues with this booking, contact the owner or campus security.</Text>
                    <TouchableOpacity 
                      style={{ marginTop: 10, backgroundColor: COLORS.background, padding: 10, borderRadius: 8, alignItems: 'center' }} 
                      onPress={() => Alert.alert('Support Request', 'Support ticket has been created.')}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>Report an Issue</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                {selectedBooking.status === 'Active' && (
                  <TouchableOpacity 
                    style={{ backgroundColor: COLORS.danger + '15', padding: 16, borderRadius: 16, marginTop: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger + '30' }} 
                    onPress={() => {
                      setBookingDetailModal(false);
                      handleCancelBooking(selectedBooking);
                    }}
                  >
                    <Text style={{ color: COLORS.danger, fontWeight: '800', fontSize: 14 }}>Cancel This Booking</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* List Spot Modal */}
      <Modal visible={listModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>List Your Parking Spot</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Spot Title *"
                value={form.title}
                onChangeText={v => setForm(f => ({ ...f, title: v }))}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Address *"
                value={form.address}
                onChangeText={v => setForm(f => ({ ...f, address: v }))}
                placeholderTextColor={COLORS.textSecondary}
              />
              <Text style={styles.inputLabel}>Spot Type *</Text>
              <View style={styles.typeRow}>
                {(['Car', 'Bike', 'EV'] as SpotType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeChip, form.type === t && styles.typeChipActive]}
                    onPress={() => setForm(f => ({ ...f, type: t }))}
                  >
                    <Text style={[styles.typeChipText, form.type === t && styles.typeChipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.input}
                placeholder="Price per hour (₹) *"
                value={form.price}
                onChangeText={v => setForm(f => ({ ...f, price: v.replace(/\D/g, '') }))}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Open Hours (e.g. 8 AM – 8 PM) *"
                value={form.openHours}
                onChangeText={v => setForm(f => ({ ...f, openHours: v }))}
                placeholderTextColor={COLORS.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Spots Available *"
                value={form.totalSpots}
                onChangeText={v => setForm(f => ({ ...f, totalSpots: v.replace(/\D/g, '') }))}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={styles.inputLabel}>Features</Text>
              {([['cctv', 'CCTV Camera'], ['covered', 'Covered/Roofed'], ['evCharging', 'EV Charging'], ['security', 'Security Guard']] as const).map(([key, label]) => (
                <View key={key} style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  <Switch
                    value={form.features[key]}
                    onValueChange={v => setForm(f => ({ ...f, features: { ...f.features, [key]: v } }))}
                    trackColor={{ true: COLORS.primary }}
                    thumbColor={COLORS.surface}
                  />
                </View>
              ))}
              <TouchableOpacity style={styles.submitBtn} onPress={handleListSpot}>
                <Text style={styles.submitBtnText}>List My Spot</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtnFull} onPress={() => setListModal(false)}>
                <Text style={styles.cancelBtnFullText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Wallet Funds Modal */}
      <Modal visible={walletModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: 36 }]}>
            <Text style={styles.modalTitle}>Add Wallet Funds</Text>
            <Text style={styles.walletCurrent}>Current Balance: ₹{walletBalance}</Text>
            <View style={styles.quickAmounts}>
              {[50, 100, 200, 500].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAmt}
                  onPress={() => setAddAmount(String(amt))}
                >
                  <Text style={styles.quickAmtText}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter custom amount"
              value={addAmount}
              onChangeText={setAddAmount}
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="number-pad"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleAddWallet}>
              <Text style={styles.submitBtnText}>Add ₹{addAmount || '0'} to Wallet</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWalletModal(false)}>
              <Text style={[styles.cancelBtnFullText, { textAlign: 'center' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  walletBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.primary, padding: SIZES.lg, paddingTop: 54,
  },
  walletLabel: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '600' },
  walletAmt: { color: COLORS.surface, fontSize: 28, fontWeight: 'bold' },
  addFundsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  addFundsText: { color: COLORS.surface, fontWeight: '700', fontSize: 13 },
  tabs: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    padding: SIZES.xs, margin: SIZES.md, borderRadius: 16, ...SHADOWS.card,
  },
  tabBtn: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.surface },
  scroll: { flex: 1, paddingHorizontal: SIZES.md },
  sectionHead: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: SIZES.sm, marginBottom: SIZES.xs },
  bookingCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: SIZES.md,
    marginBottom: SIZES.sm, borderLeftWidth: 4, ...SHADOWS.card,
  },
  bookingHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.xs },
  bookingTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  bookingAddress: { fontSize: 11, color: COLORS.textSecondary, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  bookingMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: SIZES.xs },
  metaText: { fontSize: 11, color: COLORS.textSecondary },
  bookingFooter: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: SIZES.xs },
  amountText: { fontSize: 14, fontWeight: '700', color: COLORS.success, flex: 1 },
  vehicleText: { fontSize: 11, color: COLORS.textSecondary },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cancelBtnText: { color: COLORS.danger, fontSize: 12, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: SIZES.md },
  emptySubText: { fontSize: 13, color: COLORS.textSecondary, marginTop: SIZES.xs },
  listSpotBtn: {
    backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: SIZES.md, borderRadius: 16, marginVertical: SIZES.md, gap: 8,
  },
  listSpotBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 15 },
  listedCard: {
    backgroundColor: COLORS.surface, borderRadius: 16, padding: SIZES.md,
    marginBottom: SIZES.sm, ...SHADOWS.card,
  },
  listedHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: SIZES.sm },
  listedTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  listedAddress: { fontSize: 11, color: COLORS.textSecondary },
  deleteBtn: { padding: 4 },
  listedMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  metaChip: {
    backgroundColor: COLORS.primaryLight, color: COLORS.primary,
    fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, fontWeight: '600',
  },
  spotsAvail: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  spotsAvailText: { fontSize: 12, color: COLORS.textSecondary },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  liveText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SIZES.lg, maxHeight: '90%',
  },
  detailCard: {
    backgroundColor: COLORS.surface,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: SIZES.md },
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  toggleLabel: { fontSize: 14, color: COLORS.text },
  submitBtn: {
    backgroundColor: COLORS.primary, padding: SIZES.md + 2, borderRadius: 16,
    alignItems: 'center', marginTop: SIZES.md, marginBottom: SIZES.sm,
  },
  submitBtnText: { color: COLORS.surface, fontWeight: 'bold', fontSize: 15 },
  cancelBtnFull: { alignItems: 'center', padding: SIZES.sm },
  cancelBtnFullText: { color: COLORS.textSecondary, fontSize: 14 },
  walletCurrent: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SIZES.md, textAlign: 'center' },
  quickAmounts: { flexDirection: 'row', gap: 8, marginBottom: SIZES.md },
  quickAmt: {
    flex: 1, backgroundColor: COLORS.primaryLight, padding: 10,
    borderRadius: 12, alignItems: 'center',
  },
  quickAmtText: { color: COLORS.primary, fontWeight: '700' },
});

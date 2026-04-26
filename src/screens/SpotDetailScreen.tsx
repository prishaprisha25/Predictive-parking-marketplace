import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, TextInput, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  X, Star, MapPin, Clock, Zap, Shield, Phone,
  Navigation2, CreditCard, CheckCircle2, AlertTriangle, Info,
} from 'lucide-react-native';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { useApp } from '../context/AppContext';
import { Booking } from '../types';

type RouteType = RouteProp<RootStackParamList, 'SpotDetail'>;
type PaymentMethod = 'wallet' | 'upi' | 'card';

export default function SpotDetailScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteType>();
  const { spot } = route.params;
  const { walletBalance, deductWallet, addBooking, activeBooking } = useApp();

  const [bookingModal, setBookingModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');

  const totalCost = spot.dynamicPrice * duration;

  const statusColor =
    spot.status === 'Available'
      ? COLORS.success
      : spot.status === 'Phantom'
      ? COLORS.phantom
      : COLORS.danger;

  const handleBook = () => {
    if (activeBooking) {
      Alert.alert('Active Booking', 'You already have an active booking. Cancel it first from Bookings tab.');
      return;
    }
    if (spot.status !== 'Available') {
      Alert.alert('Not Available', 'This spot is currently not available for booking.');
      return;
    }
    setBookingModal(true);
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open Google Maps.'),
    );
  };

  const handleCallOwner = () => {
    if (!spot.ownerPhone) return;
    Alert.alert(`Call ${spot.ownerName}?`, spot.ownerPhone, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call', onPress: () => Linking.openURL(`tel:${spot.ownerPhone}`) },
    ]);
  };

  const handleProceedToPayment = () => {
    setBookingModal(false);
    setPaymentModal(true);
  };

  const handlePay = () => {
    if (paymentMethod === 'wallet' && walletBalance < totalCost) {
      Alert.alert('Insufficient Balance', `Wallet has ₹${walletBalance}. Need ₹${totalCost}.`);
      return;
    }
    if (paymentMethod === 'upi' && upiId.trim().length < 5) {
      Alert.alert('Invalid UPI', 'Please enter a valid UPI ID (e.g. name@paytm).');
      return;
    }
    if (paymentMethod === 'card' && cardNumber.length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return;
    }

    if (paymentMethod === 'wallet') deductWallet(totalCost);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      spotId: spot.id,
      spotTitle: spot.title,
      address: spot.address,
      date: 'Today',
      startTime: timeStr,
      amountPaid: totalCost,
      status: 'Active',
      vehicleNumber: 'CH01-AB-5678',
    };

    addBooking(newBooking);
    setPaymentModal(false);
    setSuccessModal(true);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        color={i < Math.round(rating) ? '#F39C12' : COLORS.border}
        fill={i < Math.round(rating) ? '#F39C12' : 'transparent'}
      />
    ));

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.closeBtn} onPress={() => navigation.goBack()}>
          <X size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle} numberOfLines={1}>{spot.title}</Text>
        <View style={[s.badge, { backgroundColor: statusColor + '20' }]}>
          <Text style={[s.badgeText, { color: statusColor }]}>{spot.status}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map area with navigate button */}
        <View style={s.mapArea}>
          <Text style={s.coords}>📍 {spot.city ?? 'India'} · {spot.latitude.toFixed(4)}°N, {spot.longitude.toFixed(4)}°E</Text>
          <TouchableOpacity style={s.navBtn} onPress={handleNavigate}>
            <Navigation2 size={16} color="#fff" />
            <Text style={s.navBtnText}>Navigate in Google Maps</Text>
          </TouchableOpacity>
        </View>

        <View style={s.body}>
          {/* Title + rating */}
          <Text style={s.title}>{spot.title}</Text>
          {spot.rating !== undefined && (
            <View style={s.ratingRow}>
              <View style={s.stars}>{renderStars(spot.rating)}</View>
              <Text style={s.ratingText}>{spot.rating} · {spot.totalRatings} reviews</Text>
            </View>
          )}
          <View style={s.addrRow}>
            <MapPin size={13} color={COLORS.textSecondary} />
            <Text style={s.addrText}>{spot.address}</Text>
          </View>

          {/* Surge notice */}
          {spot.dynamicPrice > spot.basePrice && (
            <View style={s.surge}>
              <AlertTriangle size={14} color={COLORS.warning} />
              <Text style={s.surgeText}>
                Surge Active · Base ₹{spot.basePrice} → Now ₹{spot.dynamicPrice}/hr
              </Text>
            </View>
          )}

          {/* Capacity Stats */}
          <View style={s.capacityCard}>
             <View style={s.capHeader}>
                <Text style={s.capTitle}>Live Occupancy</Text>
                <Text style={s.capVal}>{spot.availableSpots} / {spot.totalSpots} Available</Text>
             </View>
             <View style={s.progressBarTrack}>
                <View style={[s.progressBarFill, { 
                  width: `${(spot.availableSpots! / spot.totalSpots!) * 100}%`,
                  backgroundColor: statusColor 
                }]} />
             </View>
             <Text style={s.capSubText}>
                {spot.status === 'Available' 
                  ? 'High probability of finding a spot in 5 mins.' 
                  : 'Currently full. AI suggests waiting or checking nearby.'}
             </Text>
          </View>

          {/* Quick stats */}
          <View style={s.statsRow}>
            <View style={s.statItem}>
              <Text style={s.statVal}>₹{spot.dynamicPrice}</Text>
              <Text style={s.statLabel}>Per Hour</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statVal}>{spot.distance}</Text>
              <Text style={s.statLabel}>Distance</Text>
            </View>
            <View style={s.statDiv} />
            <View style={s.statItem}>
              <Text style={s.statVal}>{spot.estimatedArrival}</Text>
              <Text style={s.statLabel}>ETA</Text>
            </View>
          </View>

          {/* Features */}
          <Text style={s.sec}>Features</Text>
          <View style={s.features}>
            {(spot.features ?? []).map(f => (
              <View key={f} style={s.feat}>
                <Text style={s.featText}>{f}</Text>
              </View>
            ))}
            {spot.hasEV && (
              <View style={[s.feat, { backgroundColor: '#E8F8F0' }]}>
                <Zap size={10} color={COLORS.success} />
                <Text style={[s.featText, { color: COLORS.success }]}>EV Ready</Text>
              </View>
            )}
            {spot.isStreetParking && (
              <View style={[s.feat, { backgroundColor: '#FEF9E7' }]}>
                <Info size={10} color={COLORS.warning} />
                <Text style={[s.featText, { color: COLORS.warning }]}>Street Parking</Text>
              </View>
            )}
          </View>

          {/* Hours */}
          <Text style={s.sec}>Operating Hours</Text>
          <View style={s.hoursRow}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={s.hoursText}>{spot.openHours}</Text>
          </View>

          {/* Vehicle type */}
          <Text style={s.sec}>Vehicle Type Allowed</Text>
          <View style={[s.feat, { alignSelf: 'flex-start' }]}>
            <Text style={s.featText}>
              {spot.type === 'Car' ? '🚗' : spot.type === 'Bike' ? '🏍' : '⚡'} {spot.type}
            </Text>
          </View>

          {/* Owner */}
          <Text style={s.sec}>Spot Owner</Text>
          <View style={s.ownerCard}>
            <View style={s.ownerAvatar}>
              <Text style={s.ownerInitial}>{(spot.ownerName ?? 'O')[0]}</Text>
            </View>
            <View style={s.ownerInfo}>
              <Text style={s.ownerName}>{spot.ownerName}</Text>
              <View style={s.verRow}>
                <Shield size={12} color={COLORS.success} />
                <Text style={s.verText}>Verified · {spot.totalRatings} bookings served</Text>
              </View>
            </View>
            <TouchableOpacity style={s.callBtn} onPress={handleCallOwner}>
              <Phone size={16} color={COLORS.surface} />
              <Text style={s.callText}>Call</Text>
            </TouchableOpacity>
          </View>

          {/* Phantom warning */}
          {spot.status === 'Phantom' && (
            <View style={s.phantomWarn}>
              <AlertTriangle size={18} color={COLORS.phantom} />
              <Text style={s.phantomText}>
                This spot has been flagged as a Phantom spot — it may appear available but is actually taken or doesn't exist. Approach with caution.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={s.bottomBar}>
        <View>
          <Text style={s.bottomLabel}>Starting at</Text>
          <Text style={s.bottomPrice}>₹{spot.dynamicPrice}/hr</Text>
        </View>
        <TouchableOpacity
          style={[s.bookBtn, spot.status !== 'Available' && s.bookBtnOff]}
          onPress={handleBook}
        >
          <Text style={s.bookBtnText}>
            {spot.status === 'Available' ? 'Book This Spot' : 'Unavailable'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Duration Modal ── */}
      <Modal visible={bookingModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Select Duration</Text>
            <Text style={s.modalSub} numberOfLines={1}>{spot.title}</Text>

            <View style={s.durRow}>
              <TouchableOpacity style={s.durBtn} onPress={() => setDuration(d => Math.max(1, d - 1))}>
                <Text style={s.durBtnTxt}>−</Text>
              </TouchableOpacity>
              <View style={s.durDisplay}>
                <Text style={s.durVal}>{duration}</Text>
                <Text style={s.durUnit}>hour{duration > 1 ? 's' : ''}</Text>
              </View>
              <TouchableOpacity style={s.durBtn} onPress={() => setDuration(d => Math.min(12, d + 1))}>
                <Text style={s.durBtnTxt}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={s.breakdown}>
              {[['Rate', `₹${spot.dynamicPrice}/hr`], ['Duration', `${duration} hr${duration > 1 ? 's' : ''}`]].map(([l, v]) => (
                <View key={l} style={s.bRow}>
                  <Text style={s.bLabel}>{l}</Text>
                  <Text style={s.bVal}>{v}</Text>
                </View>
              ))}
              <View style={[s.bRow, s.bTotal]}>
                <Text style={s.bTotalLabel}>Total</Text>
                <Text style={s.bTotalVal}>₹{totalCost}</Text>
              </View>
            </View>

            <TouchableOpacity style={s.proceedBtn} onPress={handleProceedToPayment}>
              <Text style={s.proceedTxt}>Proceed to Payment →</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setBookingModal(false)}>
              <Text style={s.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Payment Modal ── */}
      <Modal visible={paymentModal} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>Payment</Text>
            <Text style={s.payAmt}>₹{totalCost}</Text>
            <Text style={s.payTo}>Paying to: {spot.ownerName}</Text>

            {(['wallet', 'upi', 'card'] as PaymentMethod[]).map(m => (
              <TouchableOpacity
                key={m}
                style={[s.payRow, paymentMethod === m && s.payRowActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <View style={[s.radio, paymentMethod === m && s.radioOn]} />
                <Text style={[s.payLabel, paymentMethod === m && { color: COLORS.primary }]}>
                  {m === 'wallet' ? `💳 Wallet  (₹${walletBalance} available)` :
                   m === 'upi'    ? '📲 UPI (PhonePe / Paytm / GPay)' :
                                    '💳 Debit / Credit Card'}
                </Text>
              </TouchableOpacity>
            ))}

            {paymentMethod === 'upi' && (
              <TextInput
                style={s.input}
                placeholder="Enter UPI ID (e.g. name@paytm)"
                value={upiId}
                onChangeText={setUpiId}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
            {paymentMethod === 'card' && (
              <TextInput
                style={s.input}
                placeholder="16-digit card number"
                value={cardNumber}
                onChangeText={t => setCardNumber(t.replace(/\D/g, '').slice(0, 16))}
                placeholderTextColor={COLORS.textSecondary}
                keyboardType="number-pad"
                maxLength={16}
              />
            )}

            <TouchableOpacity style={s.proceedBtn} onPress={handlePay}>
              <Text style={s.proceedTxt}>Pay ₹{totalCost} Now</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setPaymentModal(false); setBookingModal(true); }}>
              <Text style={s.cancel}>← Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Success Modal ── */}
      <Modal visible={successModal} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={[s.modal, { alignItems: 'center' }]}>
            <CheckCircle2 size={60} color={COLORS.success} />
            <Text style={s.successTitle}>Booking Confirmed! 🎉</Text>
            <Text style={s.successSub}>{spot.title}</Text>
            <View style={s.successBox}>
              <Text style={s.successLine}>⏱ Duration: {duration} hr{duration > 1 ? 's' : ''}</Text>
              <Text style={s.successLine}>💰 Paid: ₹{totalCost} via {paymentMethod === 'wallet' ? 'Wallet' : paymentMethod === 'upi' ? 'UPI' : 'Card'}</Text>
              <Text style={s.successLine}>📍 {spot.address}</Text>
              <Text style={s.successLine}>🏙 City: {spot.city ?? 'India'}</Text>
              <Text style={s.successLine}>🚗 Vehicle: CH01-AB-5678</Text>
            </View>
            <TouchableOpacity style={s.proceedBtn} onPress={() => { setSuccessModal(false); navigation.goBack(); }}>
              <Text style={s.proceedTxt}>View My Bookings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: SIZES.lg,
    paddingTop: 54, backgroundColor: COLORS.surface, ...SHADOWS.card,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.background,
    alignItems: 'center', justifyContent: 'center', marginRight: SIZES.sm,
  },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: COLORS.text },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '800' },

  mapArea: {
    height: 130, backgroundColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  coords: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
  },
  navBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  body: { padding: SIZES.lg },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  stars: { flexDirection: 'row', gap: 2 },
  ratingText: { fontSize: 12, color: COLORS.textSecondary },
  addrRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  addrText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },

  surge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF9E7', borderLeftWidth: 4, borderLeftColor: COLORS.warning,
    padding: 10, borderRadius: 10, marginTop: 12,
  },
  surgeText: { color: COLORS.warning, fontSize: 12, fontWeight: '600', flex: 1 },

  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.surface,
    borderRadius: 16, padding: 14, marginTop: 16, ...SHADOWS.card, alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 9, color: COLORS.textSecondary, marginTop: 2 },
  statDiv: { width: 1, height: 28, backgroundColor: COLORS.border },

  capacityCard: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    ...SHADOWS.card,
  },
  capHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  capTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  capVal: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  progressBarTrack: { height: 8, backgroundColor: COLORS.background, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  capSubText: { fontSize: 11, color: COLORS.textSecondary, marginTop: 8, fontStyle: 'italic' },

  sec: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  feat: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
  },
  featText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },

  hoursRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, padding: 12, borderRadius: 12,
  },
  hoursText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },

  ownerCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    padding: 14, borderRadius: 16, ...SHADOWS.card,
  },
  ownerAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  ownerInitial: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  ownerInfo: { flex: 1, marginLeft: 12 },
  ownerName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  verRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  verText: { fontSize: 10, color: COLORS.success, fontWeight: '600' },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14,
  },
  callText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  phantomWarn: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: COLORS.phantom + '15', borderLeftWidth: 4, borderLeftColor: COLORS.phantom,
    padding: 12, borderRadius: 12, marginTop: 16,
  },
  phantomText: { flex: 1, color: COLORS.phantom, fontSize: 12, fontWeight: '600', lineHeight: 18 },

  bottomBar: {
    flexDirection: 'row', alignItems: 'center', padding: SIZES.lg,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, paddingBottom: 28,
  },
  bottomLabel: { fontSize: 10, color: COLORS.textSecondary },
  bottomPrice: { fontSize: 20, fontWeight: '900', color: COLORS.text, flex: 1 },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 18 },
  bookBtnOff: { backgroundColor: COLORS.textSecondary },
  bookBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: COLORS.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30,
    padding: SIZES.xl, paddingBottom: 36,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },

  durRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  durBtn: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  durBtnTxt: { fontSize: 26, fontWeight: '900', color: COLORS.primary },
  durDisplay: { alignItems: 'center', marginHorizontal: 36 },
  durVal: { fontSize: 40, fontWeight: '900', color: COLORS.text },
  durUnit: { fontSize: 13, color: COLORS.textSecondary },

  breakdown: { backgroundColor: COLORS.background, borderRadius: 16, padding: 14, marginBottom: 20 },
  bRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
  bLabel: { fontSize: 14, color: COLORS.textSecondary },
  bVal: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  bTotal: { borderTopWidth: 1, borderTopColor: COLORS.border, marginTop: 4, paddingTop: 12 },
  bTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  bTotalVal: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

  proceedBtn: {
    backgroundColor: COLORS.primary, padding: 16, borderRadius: 18,
    alignItems: 'center', marginBottom: 12,
  },
  proceedTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cancel: { textAlign: 'center', color: COLORS.textSecondary, fontSize: 14, paddingVertical: 6 },

  payAmt: { fontSize: 38, fontWeight: '900', color: COLORS.text, textAlign: 'center', marginVertical: 6 },
  payTo: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 18 },
  payRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, marginBottom: 8, gap: 10,
  },
  payRowActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.border },
  radioOn: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  payLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, flex: 1 },
  input: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    padding: 14, marginBottom: 12, color: COLORS.text, fontSize: 14,
  },

  successTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, marginTop: 12 },
  successSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  successBox: {
    backgroundColor: COLORS.background, borderRadius: 16,
    padding: 14, width: '100%', marginBottom: 20,
  },
  successLine: { fontSize: 13, color: COLORS.text, paddingVertical: 4 },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Animated, Dimensions, Image,
} from 'react-native';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import {
  Zap, Navigation2, CheckCircle2, MapPin, Clock,
  Star, TrendingUp, ChevronRight, Search, Mic, 
  Filter, Award, Map as MapIcon, Layers
} from 'lucide-react-native';
import { CITY_CONFIGS } from '../utils/mockData';
import { COLORS, SIZES, SHADOWS } from '../theme/theme';
import { ParkingSpot } from '../types';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

type FilterType = 'All' | 'Car' | 'Bike' | 'EV';
type CityKey = 'Chandigarh' | 'Mumbai';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { walletBalance, activeBooking } = useApp();
  const mapRef = useRef<MapView>(null);

  const [selectedFilter, setSelectedFilter] = useState<FilterType>('All');
  const [activeCity, setActiveCity] = useState<CityKey>('Chandigarh');
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(headerY, {
      toValue: 0,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const cityConfig = CITY_CONFIGS[activeCity];
  const filteredSpots = cityConfig.spots.filter(spot =>
    selectedFilter === 'All' ? true : spot.type === selectedFilter
  );

  const available = filteredSpots.filter(s => s.status === 'Available').length;
  const occupied = filteredSpots.filter(s => s.status === 'Occupied').length;

  const markerColor = (spot: ParkingSpot) => {
    if (spot.status === 'Available') return COLORS.success;
    if (spot.status === 'Phantom') return COLORS.phantom;
    return COLORS.danger;
  };

  const handleCitySwitch = (city: CityKey) => {
    setActiveCity(city);
    mapRef.current?.animateToRegion(CITY_CONFIGS[city].region, 800);
  };

  const featured = [...filteredSpots]
    .filter(s => s.status === 'Available')
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <View style={styles.container}>
      {/* ── MAP ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={cityConfig.region}
        showsUserLocation
        showsMyLocationButton={false}
        customMapStyle={mapStyle} // Dark mode-ish style
      >
        {filteredSpots.map(spot => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
            onPress={() => navigation.navigate('SpotDetail', { spot })}
          >
            <Animated.View style={[
              styles.markerWrap, 
              spot.confidence === 'High' && { transform: [{ scale: pulseAnim }] }
            ]}>
              <View style={[styles.markerBubble, { backgroundColor: markerColor(spot) }]}>
                 {spot.type === 'EV' ? <Zap size={12} color="#fff" fill="#fff" /> : 
                  spot.type === 'Bike' ? <Text style={styles.markerEmoji}>🏍️</Text> :
                  <Text style={styles.markerText}>₹{spot.dynamicPrice}</Text>}
              </View>
              <View style={[styles.markerTail, { borderTopColor: markerColor(spot) }]} />
            </Animated.View>

            <Callout onPress={() => navigation.navigate('SpotDetail', { spot })} tooltip>
              <View style={styles.callout}>
                <View style={styles.calloutHeader}>
                   <Text style={styles.calloutTitle}>{spot.title}</Text>
                   <Award size={14} color={COLORS.warning} fill={COLORS.warning} />
                </View>
                <Text style={styles.calloutAddr} numberOfLines={1}>{spot.address}</Text>
                <View style={styles.calloutStats}>
                   <View style={styles.calloutStat}>
                      <Clock size={10} color={COLORS.primary} />
                      <Text style={styles.calloutStatText}>{spot.estimatedArrival}</Text>
                   </View>
                   <View style={styles.calloutStat}>
                      <Star size={10} color="#F39C12" fill="#F39C12" />
                      <Text style={styles.calloutStatText}>{spot.rating}</Text>
                   </View>
                </View>
                <TouchableOpacity style={styles.calloutBtn}>
                   <Text style={styles.calloutBtnText}>View Details</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}

        <Circle
          center={{ latitude: cityConfig.region.latitude, longitude: cityConfig.region.longitude }}
          radius={activeCity === 'Mumbai' ? 4000 : 2000}
          strokeColor={COLORS.primary + '20'}
          fillColor={COLORS.primary + '08'}
        />
      </MapView>

      {/* ── FLOATING OVERLAYS ── */}
      
      {/* Header Bar */}
      <Animated.View style={[styles.headerFloating, { transform: [{ translateY: headerY }] }]}>
        <View style={styles.searchBar}>
          <Search size={20} color={COLORS.textSecondary} style={{ marginLeft: 12 }} />
          <Text style={styles.searchPlaceholder}>Search in {activeCity}...</Text>
          <View style={styles.searchRight}>
            <View style={styles.vLine} />
            <TouchableOpacity><Mic size={20} color={COLORS.primary} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerRow}>
           <View style={styles.cityPill}>
              {(['Chandigarh', 'Mumbai'] as CityKey[]).map(city => (
                <TouchableOpacity 
                  key={city}
                  onPress={() => handleCitySwitch(city)}
                  style={[styles.cityOption, activeCity === city && styles.cityOptionActive]}
                >
                   <Text style={[styles.cityText, activeCity === city && styles.cityTextActive]}>{city}</Text>
                </TouchableOpacity>
              ))}
           </View>

           <TouchableOpacity style={styles.walletGlass}>
              <Text style={styles.walletVal}>₹{walletBalance}</Text>
              <View style={styles.walletDot} />
           </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Filter Overlay */}
      <View style={styles.filterOverlay}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {(['All', 'Car', 'Bike', 'EV'] as FilterType[]).map(f => (
              <TouchableOpacity
                key={f}
                onPress={() => setSelectedFilter(f)}
                style={[styles.filterPill, selectedFilter === f && styles.filterPillActive]}
              >
                 <Text style={[styles.filterPillText, selectedFilter === f && styles.filterPillTextActive]}>
                    {f === 'All' ? '🗺️ ' : f === 'Car' ? '🚗 ' : f === 'Bike' ? '🏍️ ' : '⚡ '}
                    {f}
                 </Text>
              </TouchableOpacity>
            ))}
         </ScrollView>
      </View>

      {/* Layer Controls */}
      <View style={styles.layerControls}>
         <TouchableOpacity style={styles.layerBtn}><Layers size={20} color={COLORS.text} /></TouchableOpacity>
         <TouchableOpacity style={styles.layerBtn}><Navigation2 size={20} color={COLORS.primary} /></TouchableOpacity>
      </View>

      {/* ── BOTTOM SHEET CONTENT ── */}
      <View style={styles.sheetContainer}>
         <View style={styles.sheetHandle} />
         
         <ScrollView style={styles.sheetContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
            
            {/* Quick Summary Row */}
            <View style={styles.summaryRow}>
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryVal}>{available}</Text>
                  <Text style={styles.summaryLabel}>Free</Text>
               </View>
               <View style={styles.summaryDiv} />
               <View style={styles.summaryItem}>
                  <Text style={styles.summaryVal}>{occupied}</Text>
                  <Text style={styles.summaryLabel}>Busy</Text>
               </View>
               <View style={styles.summaryDiv} />
               <View style={styles.summaryItem}>
                  <Text style={[styles.summaryVal, { color: COLORS.primary }]}>₹{filteredSpots.length > 0 ? Math.min(...filteredSpots.map(s => s.dynamicPrice)) : 0}</Text>
                  <Text style={styles.summaryLabel}>Min. Rate</Text>
               </View>
            </View>

            {/* Featured Section */}
            <View style={styles.sectionHeader}>
               <View style={styles.sectionTitleRow}>
                  <Award size={18} color={COLORS.warning} fill={COLORS.warning} />
                  <Text style={styles.sectionTitle}>Featured Premium Spots</Text>
               </View>
               <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
               {featured.map(spot => (
                 <TouchableOpacity 
                   key={spot.id} 
                   style={styles.featuredCard}
                   onPress={() => navigation.navigate('SpotDetail', { spot })}
                 >
                    <View style={styles.featuredTag}>
                       <Text style={styles.featuredTagText}>POPULAR</Text>
                    </View>
                    <Text style={styles.fTitle} numberOfLines={1}>{spot.title}</Text>
                    <View style={styles.fRating}>
                       <Star size={12} color="#F39C12" fill="#F39C12" />
                       <Text style={styles.fRatingText}>{spot.rating} ({spot.totalRatings})</Text>
                    </View>
                    <View style={styles.fMeta}>
                       <View style={styles.fMetaItem}>
                          <MapPin size={10} color={COLORS.textSecondary} />
                          <Text style={styles.fMetaText}>{spot.distance}</Text>
                       </View>
                       <View style={styles.fMetaItem}>
                          <Clock size={10} color={COLORS.textSecondary} />
                          <Text style={styles.fMetaText}>{spot.estimatedArrival}</Text>
                       </View>
                    </View>
                    <View style={styles.fFooter}>
                       <Text style={styles.fPrice}>₹{spot.dynamicPrice}<Text style={{ fontSize: 10, color: COLORS.textSecondary }}> /hr</Text></Text>
                       <View style={styles.fCapacity}>
                          <View style={[styles.fCapDot, { backgroundColor: markerColor(spot) }]} />
                          <Text style={styles.fCapText}>{spot.availableSpots} Free</Text>
                       </View>
                    </View>
                 </TouchableOpacity>
               ))}
            </ScrollView>

            {/* Ambient Driving CTA */}
            <TouchableOpacity 
              style={styles.ambientCta}
              onPress={() => navigation.navigate('AmbientDriving', {})}
            >
               <View style={styles.ambientLeft}>
                  <View style={styles.ambientIconWrap}>
                     <Navigation2 size={24} color="#fff" />
                  </View>
                  <View>
                     <Text style={styles.ambientTitle}>Enter Ambient Mode</Text>
                     <Text style={styles.ambientSub}>Zero-UI Voice Navigation</Text>
                  </View>
               </View>
               <ChevronRight size={20} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>

            {/* All Nearby Spots List */}
            <View style={styles.sectionHeader}>
               <Text style={styles.sectionTitle}>All Nearby Spots</Text>
               <TouchableOpacity style={styles.filterBtn}>
                  <Filter size={14} color={COLORS.primary} />
                  <Text style={styles.filterBtnText}>Sort</Text>
               </TouchableOpacity>
            </View>

            {filteredSpots.map(spot => (
              <TouchableOpacity 
                key={spot.id} 
                style={styles.spotListItem}
                onPress={() => navigation.navigate('SpotDetail', { spot })}
              >
                 <View style={[styles.spotListIcon, { backgroundColor: markerColor(spot) + '15' }]}>
                    {spot.type === 'EV' ? <Zap size={18} color={COLORS.success} /> : 
                     spot.type === 'Bike' ? <Text style={{ fontSize: 18 }}>🏍️</Text> :
                     <MapPin size={18} color={COLORS.primary} />}
                 </View>
                 <View style={styles.spotListBody}>
                    <Text style={styles.spotListTitle} numberOfLines={1}>{spot.title}</Text>
                    <Text style={styles.spotListAddr} numberOfLines={1}>{spot.address}</Text>
                    <View style={styles.spotListMeta}>
                       <Text style={styles.metaLabel}>📍 {spot.distance}</Text>
                       <View style={styles.metaDot} />
                       <Text style={styles.metaLabel}>⏱ {spot.estimatedArrival}</Text>
                       <View style={styles.metaDot} />
                       <Text style={[styles.metaLabel, { color: markerColor(spot) }]}>{spot.availableSpots}/{spot.totalSpots} Free</Text>
                    </View>
                 </View>
                 <View style={styles.spotListRight}>
                    <Text style={styles.spotListPrice}>₹{spot.dynamicPrice}</Text>
                    <Text style={styles.spotListUnit}>/hr</Text>
                 </View>
              </TouchableOpacity>
            ))}

            <View style={{ height: 40 }} />
         </ScrollView>
      </View>

      {/* Success Modal (DEV) */}
      <Modal visible={checkoutModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <CheckCircle2 size={52} color={COLORS.success} />
            <Text style={styles.modalTitle}>Checkout Confirmed</Text>
            <Text style={styles.modalSub}>Transaction completed via Smart Wallet.</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setCheckoutModal(false)}>
              <Text style={styles.modalBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const mapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#212a37" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#9ca5b3" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  map: { width: '100%', height: '55%' },

  // Markers
  markerWrap: { alignItems: 'center', justifyContent: 'center' },
  markerBubble: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    borderWidth: 2, borderColor: '#fff', ...SHADOWS.card,
    alignItems: 'center', justifyContent: 'center'
  },
  markerText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  markerEmoji: { fontSize: 12 },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: -2
  },

  // Callout
  callout: {
    backgroundColor: '#fff', borderRadius: 20, padding: 15,
    width: 240, ...SHADOWS.floating, borderWidth: 1, borderColor: '#eee'
  },
  calloutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  calloutTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, flex: 1 },
  calloutAddr: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 10 },
  calloutStats: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  calloutStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  calloutStatText: { fontSize: 11, fontWeight: '700', color: COLORS.text },
  calloutBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 8, borderRadius: 12, alignItems: 'center'
  },
  calloutBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // Floating Header
  headerFloating: {
    position: 'absolute', top: 50, left: 20, right: 20, zIndex: 10
  },
  searchBar: {
    backgroundColor: '#fff', height: 50, borderRadius: 15,
    flexDirection: 'row', alignItems: 'center', ...SHADOWS.card,
    marginBottom: 15
  },
  searchPlaceholder: { flex: 1, color: COLORS.textSecondary, fontSize: 14, marginLeft: 10 },
  searchRight: { flexDirection: 'row', alignItems: 'center', paddingRight: 12 },
  vLine: { width: 1, height: 20, backgroundColor: '#eee', marginHorizontal: 10 },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cityPill: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12, padding: 4, ...SHADOWS.card
  },
  cityOption: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  cityOptionActive: { backgroundColor: COLORS.primary },
  cityText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  cityTextActive: { color: '#fff' },

  walletGlass: {
    backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12,
    paddingVertical: 10, borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', gap: 6, ...SHADOWS.card
  },
  walletVal: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  walletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },

  filterOverlay: { position: 'absolute', top: 185, left: 0, right: 0, zIndex: 10 },
  filterPill: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, marginRight: 10, ...SHADOWS.card, borderWidth: 1, borderColor: '#eee'
  },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterPillText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  filterPillTextActive: { color: '#fff' },

  layerControls: { position: 'absolute', top: 250, right: 20, zIndex: 10, gap: 10 },
  layerBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', ...SHADOWS.card
  },

  // Bottom Sheet
  sheetContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: '48%', backgroundColor: '#fff', borderTopLeftRadius: 35,
    borderTopRightRadius: 35, ...SHADOWS.floating
  },
  sheetHandle: {
    width: 40, height: 5, backgroundColor: '#eee',
    borderRadius: 3, alignSelf: 'center', marginTop: 12, marginBottom: 5
  },
  sheetContent: { paddingHorizontal: 20 },

  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#f8faff', borderRadius: 20, padding: 15, marginVertical: 15
  },
  summaryItem: { alignItems: 'center' },
  summaryVal: { fontSize: 18, fontWeight: '900', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  summaryDiv: { width: 1, height: 25, backgroundColor: '#ddd' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10, marginBottom: 15
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  seeAll: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  featuredScroll: { marginBottom: 20 },
  featuredCard: {
    width: 170, backgroundColor: '#fff', borderRadius: 24, padding: 15,
    marginRight: 15, borderWidth: 1, borderColor: '#f0f0f0', ...SHADOWS.card
  },
  featuredTag: {
    backgroundColor: '#fff9e6', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 10
  },
  featuredTagText: { fontSize: 9, fontWeight: '900', color: '#f39c12' },
  fTitle: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginBottom: 5 },
  fRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  fRatingText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  fMeta: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  fMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  fMetaText: { fontSize: 9, color: COLORS.textSecondary, fontWeight: '600' },
  fFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  fPrice: { fontSize: 14, fontWeight: '900', color: COLORS.primary },
  fCapacity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  fCapDot: { width: 6, height: 6, borderRadius: 3 },
  fCapText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },

  ambientCta: {
    backgroundColor: '#1a1a2e', borderRadius: 24, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 25, ...SHADOWS.card
  },
  ambientLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  ambientIconWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center'
  },
  ambientTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  ambientSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },

  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.primaryLight, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 10
  },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  spotListItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 20, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#f5f5f5', ...SHADOWS.card
  },
  spotListIcon: {
    width: 50, height: 50, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center'
  },
  spotListBody: { flex: 1, marginLeft: 12 },
  spotListTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  spotListAddr: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  spotListMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaLabel: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#ccc', marginHorizontal: 6 },
  spotListRight: { alignItems: 'flex-end' },
  spotListPrice: { fontSize: 16, fontWeight: '900', color: COLORS.text },
  spotListUnit: { fontSize: 10, color: COLORS.textSecondary },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', padding: 30, borderRadius: 25, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, marginTop: 15 },
  modalSub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center' },
  modalBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 15, marginTop: 20 },
  modalBtnText: { color: '#fff', fontWeight: '800' }
});

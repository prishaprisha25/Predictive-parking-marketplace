import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, ListedSpot, ParkingSpot } from '../types';
import { MOCK_BOOKINGS, MOCK_LISTED_SPOTS, currentUser as mockUser } from '../utils/mockData';

interface AppState {
  walletBalance: number;
  bookings: Booking[];
  listedSpots: ListedSpot[];
  activeBooking: Booking | null;
  userName: string;
  trustScore: number;
  totalParkings: number;
  moneySaved: number;
  vehicleNumber: string;
  emergencyContact: string;
  emergencyContactName: string;
  addBooking: (b: Booking) => void;
  cancelBooking: (id: string) => void;
  addListedSpot: (spot: ListedSpot) => void;
  removeListedSpot: (id: string) => void;
  deductWallet: (amount: number) => void;
  addWallet: (amount: number) => void;
  updateProfile: (data: Partial<{ vehicleNumber: string; emergencyContact: string; emergencyContactName: string }>) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(mockUser.walletBalance);
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [listedSpots, setListedSpots] = useState<ListedSpot[]>(MOCK_LISTED_SPOTS);
  const [vehicleNumber, setVehicleNumber] = useState(mockUser.vehicleNumber);
  const [emergencyContact, setEmergencyContact] = useState(mockUser.emergencyContact);
  const [emergencyContactName, setEmergencyContactName] = useState(mockUser.emergencyContactName);

  const activeBooking = bookings.find(b => b.status === 'Active') ?? null;

  const addBooking = (b: Booking) => setBookings(prev => [b, ...prev]);

  const cancelBooking = (id: string) =>
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'Cancelled' as const } : b));

  const addListedSpot = (spot: ListedSpot) => setListedSpots(prev => [spot, ...prev]);

  const removeListedSpot = (id: string) =>
    setListedSpots(prev => prev.filter(s => s.id !== id));

  const deductWallet = (amount: number) =>
    setWalletBalance(prev => Math.max(0, prev - amount));

  const addWallet = (amount: number) =>
    setWalletBalance(prev => prev + amount);

  const updateProfile = (data: Partial<{ vehicleNumber: string; emergencyContact: string; emergencyContactName: string }>) => {
    if (data.vehicleNumber !== undefined) setVehicleNumber(data.vehicleNumber);
    if (data.emergencyContact !== undefined) setEmergencyContact(data.emergencyContact);
    if (data.emergencyContactName !== undefined) setEmergencyContactName(data.emergencyContactName);
  };

  return (
    <AppContext.Provider value={{
      walletBalance,
      bookings,
      listedSpots,
      activeBooking,
      userName: mockUser.name,
      trustScore: mockUser.trustScore,
      totalParkings: mockUser.totalParkings,
      moneySaved: mockUser.moneySaved,
      vehicleNumber,
      emergencyContact,
      emergencyContactName,
      addBooking,
      cancelBooking,
      addListedSpot,
      removeListedSpot,
      deductWallet,
      addWallet,
      updateProfile,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  confidence: 'High' | 'Medium' | 'Low';
  status: 'Available' | 'Occupied' | 'Phantom';
  hasEV: boolean;
  basePrice: number;
  dynamicPrice: number;
  type: 'Car' | 'Bike' | 'EV';
  isStreetParking: boolean;
  ownerName?: string;
  ownerPhone?: string;
  rating?: number;
  totalRatings?: number;
  features?: string[];
  openHours?: string;
  distance?: string;
  estimatedArrival?: string;
  listedByUid?: string;
  city?: string;
  totalSpots?: number;
  availableSpots?: number;
}

export interface UserProfile {
  name: string;
  rollNumber: string;
  trustScore: number;
  spotsVerified: number;
  phantomSpotsOverridden: number;
  walletBalance: number;
  vehicleType: 'Car' | 'Bike' | 'EV';
  vehicleNumber: string;
  totalParkings: number;
  moneySaved: number;
  emergencyContact: string;
  emergencyContactName: string;
}

export interface Booking {
  id: string;
  spotId: string;
  spotTitle: string;
  address: string;
  date: string;
  startTime: string;
  endTime?: string;
  duration?: string;
  amountPaid: number;
  status: 'Active' | 'Completed' | 'Cancelled';
  vehicleNumber: string;
  transactionId?: string;
  paymentMethod?: string;
}

export interface ListedSpot {
  id: string;
  title: string;
  address: string;
  type: 'Car' | 'Bike' | 'EV';
  price: number;
  openHours: string;
  totalSpots: number;
  availableSpots: number;
  latitude: number;
  longitude: number;
  features: string[];
  ownerName: string;
}

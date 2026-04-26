import { ParkingSpot } from './index';

export type RootTabParamList = {
  HomeTab: undefined;
  Bookings: undefined;
  Safety: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  AmbientDriving: { spotId?: string };
  SpotDetail: { spot: ParkingSpot };
};

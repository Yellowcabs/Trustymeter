export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface FareSettings {
  baseFare: number;
  pricePerKm: number;
  waitingChargePerMin: number;
  driverName?: string;
  vehicleNumber?: string;
}

export interface TripData {
  id: string;
  startTime: number;
  endTime?: number;
  distance: number; // in km
  duration: number; // in seconds
  waitingTime: number; // in seconds
  totalFare: number;
  route: Location[];
  fareSettings: FareSettings;
}

export type TripStatus = 'IDLE' | 'ACTIVE' | 'WAITING' | 'COMPLETED';

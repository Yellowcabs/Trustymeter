import { useState, useEffect, useRef } from 'react';
import { Location } from '../types';
import { calculateDistance } from '../utils';

export function useGeolocation(isActive: boolean, initialDistance: number = 0) {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [distance, setDistance] = useState(initialDistance);
  const [route, setRoute] = useState<Location[]>([]);
  const [speed, setSpeed] = useState(0);
  const lastLocationRef = useRef<Location | null>(null);

  useEffect(() => {
    if (initialDistance > 0 && distance === 0) {
      setDistance(initialDistance);
    }
  }, [initialDistance]);

  useEffect(() => {
    if (!isActive) {
        lastLocationRef.current = null;
        setSpeed(0);
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed: currentSpeed } = position.coords;
        
        // 1. Accuracy Filter: Ignore points with poor accuracy (> 25m)
        if (accuracy > 25) return;

        const newLocation: Location = {
          lat: latitude,
          lng: longitude,
          timestamp: position.timestamp,
        };

        setCurrentLocation(newLocation);
        setRoute((prev) => [...prev, newLocation]);
        setSpeed(currentSpeed || 0);

        if (lastLocationRef.current) {
          const d = calculateDistance(
            lastLocationRef.current.lat,
            lastLocationRef.current.lng,
            newLocation.lat,
            newLocation.lng
          );
          
          // 2. Jitter Filter: Ignore very small movements (less than 5 meters)
          // 3. Speed Filter: Ignore impossible jumps (over 150 km/h or 0.25km per update)
          const timeDiff = (newLocation.timestamp - lastLocationRef.current.timestamp) / 1000;
          const speedKmh = d / (timeDiff / 3600);

          if (d > 0.005 && d < 0.3 && speedKmh < 150) {
            // Use true distance for "accurate" calculation
            setDistance((prev) => prev + d);
            lastLocationRef.current = newLocation;
          }
        } else {
          lastLocationRef.current = newLocation;
        }
      },
      (error) => console.error('Geolocation error:', error),
      { 
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isActive]);

  const resetDistance = () => {
    setDistance(0);
    setRoute([]);
    setSpeed(0);
    lastLocationRef.current = null;
  };

  return { currentLocation, distance, speed, route, resetDistance };
}

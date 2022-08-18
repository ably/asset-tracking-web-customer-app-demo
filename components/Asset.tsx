import { LocationUpdate, Subscriber } from '@ably/asset-tracking';
import { useEffect, useRef, useState } from 'react';
import Circle from './Circle';
import Marker from './Marker';

interface AssetProps {
  map?: google.maps.Map;
  subscriber: Subscriber;
  name: string;
  destination: google.maps.LatLngLiteral;
  completeOrder: () => void;
}

const CIRCLE_STROKE_COLOR = '#FF0000';
const CIRCLE_STROKE_OPACITY = 0.8;
const CIRCLE_STROKE_WEIGHT = 2;
const CIRCLE_FILL_COLOR = '#FF0000';
const CIRCLE_FILL_OPACITY = 0.35;

const rad = function(x: number) {
  return x * Math.PI / 180;
};

const getDistance = function(p1: google.maps.LatLngLiteral, p2: google.maps.LatLngLiteral) {
  const R = 6378137; // Earth’s mean radius in meters
  const dLat = rad(p2.lat - p1.lat);
  const dLong = rad(p2.lng - p1.lng);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // returns the distance in meters
};

function bearingToCompass(bearing: number) {
  if ((bearing >= 0 && bearing < 23) || (bearing >= 337 && bearing <= 360)) {
    return 'N';
  }
  if (bearing >= 23 && bearing < 67) {
    return 'NE';
  }
  if (bearing >= 67 && bearing < 113) {
    return 'E';
  }
  if (bearing >= 113 && bearing < 158) {
    return 'SE';
  }
  if (bearing >= 158 && bearing < 203) {
    return 'S';
  }
  if (bearing >= 203 && bearing < 247) {
    return 'SW';
  }
  if (bearing >= 247 && bearing < 292) {
    return 'W';
  }
  if (bearing >= 292 && bearing < 337) {
    return 'NW';
  }

  console.warn('Recieved location update with bearing not in range 0-360, value was: ', bearing);
  return 'N';
}

const Asset = ({ map, subscriber, name, destination, completeOrder }: AssetProps) => {
  const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [direction, setDirection] = useState<string>('N');
  const [accuracy, setAccuracy] = useState<number>(0);
  const locationUpdatesBegun = useRef<boolean>(false);

  useEffect(() => {
    (subscriber as any).onLocationUpdate = (locationUpdate: LocationUpdate) => {
      const [lng, lat] = locationUpdate.location.geometry.coordinates;
      if (getDistance({lat, lng}, destination) < 10) {
        subscriber.stop();
        completeOrder();
        return;
      }
      setLocation({ lat, lng });
      setDirection(bearingToCompass(locationUpdate.location.properties.bearing));
      setAccuracy(locationUpdate.location.properties.accuracyHorizontal);
    };
    subscriber.start(name);
  }, [subscriber, name, map]);

  // Zoom into asset when tracking begins
  useEffect(() => {
    if (location && !locationUpdatesBegun.current) {
      map?.setZoom(15);
      map?.setCenter(location);
      locationUpdatesBegun.current = true;
    }
  }, [location, map]);

  return (
    <>
      {location && (
        <>
          <Marker icon={`/driver${direction}.png`} map={map} position={location} />
          <Circle
            map={map}
            radius={accuracy}
            center={location}
            fillColor={CIRCLE_FILL_COLOR}
            fillOpacity={CIRCLE_FILL_OPACITY}
            strokeColor={CIRCLE_STROKE_COLOR}
            strokeWeight={CIRCLE_STROKE_WEIGHT}
            strokeOpacity={CIRCLE_STROKE_OPACITY}
          />
        </>
      )}
    </>
  );
};

export default Asset;

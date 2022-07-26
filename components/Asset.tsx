import { LocationUpdate, Subscriber } from '@ably/asset-tracking';
import { useEffect, useState } from 'react';
import Marker from './Marker';

interface AssetProps {
  map?: google.maps.Map;
  subscriber: Subscriber;
}

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

const Asset = ({ map, subscriber }: AssetProps) => {
  const [location, setLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [direction, setDirection] = useState<string>('N');

  useEffect(() => {
    (subscriber as any).onLocationUpdate = (locationUpdate: LocationUpdate) => {
      const [lng, lat] = locationUpdate.location.geometry.coordinates;
      setLocation({ lat, lng });
      setDirection(bearingToCompass(locationUpdate.location.properties.bearing));
    };
  }, [subscriber]);

  return <>{location && <Marker icon={`/driver${direction}.png`} map={map} position={location} />}</>;
};

export default Asset;

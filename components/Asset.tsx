import { LocationUpdate, Subscriber } from '@ably/asset-tracking';
import { useEffect, useState } from 'react';
import Circle from './Circle';
import Marker from './Marker';

interface AssetProps {
  map?: google.maps.Map;
  subscriber: Subscriber;
}

const CIRCLE_STROKE_COLOR = '#FF0000';
const CIRCLE_STROKE_OPACITY = 0.8;
const CIRCLE_STROKE_WEIGHT = 2;
const CIRCLE_FILL_COLOR = '#FF0000';
const CIRCLE_FILL_OPACITY = 0.35;

// strokeColor: "#FF0000",
// strokeOpacity: 0.8,
// strokeWeight: 2,
// fillColor: "#FF0000",
// fillOpacity: 0.35,
// map,
// center: markerCoordinate,
// radius: 100,

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
  const [accuracy, setAccuracy] = useState<number>(0);

  useEffect(() => {
    (subscriber as any).onLocationUpdate = (locationUpdate: LocationUpdate) => {
      const [lng, lat] = locationUpdate.location.geometry.coordinates;
      setLocation({ lat, lng });
      setDirection(bearingToCompass(locationUpdate.location.properties.bearing));
      setAccuracy(locationUpdate.location.properties.accuracyHorizontal);
    };
  }, [subscriber]);

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

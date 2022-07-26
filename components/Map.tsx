import React, { useEffect, useRef, useState } from 'react';

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  children: any;
}

function MapComponent({ center, zoom, children }: MapComponentProps) {
  const ref = useRef();
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    setMap(
      new window.google.maps.Map(ref.current as any, {
        center,
        zoom,
      })
    );
  }, [setMap, center, zoom]);

  return (
    <div ref={ref as any} id="map">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // set the map prop on the child component
          return React.cloneElement(child, { map } as any);
        }
      })}
    </div>
  );
}

export default MapComponent;

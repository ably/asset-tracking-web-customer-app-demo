import { useEffect, useState } from 'react';

const Circle: React.FC<google.maps.CircleOptions> = (options) => {
  const [circle, setCircle] = useState<google.maps.Circle>();

  useEffect(() => {
    if (!circle) {
      setCircle(new google.maps.Circle());
    }

    // remove marker from map on unmount
    return () => {
      if (circle) {
        circle.setMap(null);
      }
    };
  }, [circle]);

  useEffect(() => {
    if (circle) {
      circle.setOptions(options);
    }
  }, [circle, options]);

  return null;
};

export default Circle;

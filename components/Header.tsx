import { Subscriber } from '@ably/asset-tracking';
import { FormEvent, useEffect, useRef, useState } from 'react';

const driverPresent = 'Driver is online';
const noDrivers = 'Driver is offline';

interface HeaderProps {
  children?: JSX.Element;
}

const Header = ({ children }: HeaderProps) => {
  return (
    <header>
      <h1>
        <a href="http://ably.com/" className="logo">
          Ably
        </a>
        <span className="title">Asset Tracking</span>
      </h1>
      {children}
    </header>
  );
};

interface DriverStatusProps {
  subscriber: Subscriber;
}

export const DriverStatus = ({ subscriber }: DriverStatusProps) => {
  const [driverStatus, setDriverStatus] = useState(noDrivers);

  useEffect(() => {
    (subscriber as any).onStatusUpdate = (isOnline: boolean) => {
      setDriverStatus(isOnline ? driverPresent : noDrivers);
    };
  }, [subscriber]);

  return (
    <div id="channel">
      <h2 className="subscribers" id="subscriberCount">
        {driverStatus}
      </h2>
    </div>
  );
};

export default Header;

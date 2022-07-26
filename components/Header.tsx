import { Subscriber } from '@ably/asset-tracking';
import { FormEvent, useEffect, useRef, useState } from 'react';

const driverPresent = 'Driver is online';
const noDrivers = 'Driver is offline';

interface HeaderProps {
  subscriber: Subscriber;
}

const Header = ({ subscriber }: HeaderProps) => {
  const [inputText, setInputText] = useState('');
  const [trackingId, setTrackingId] = useState<null | string>(null);
  const [driverStatus, setDriverStatus] = useState(noDrivers);
  const tracking = useRef(false);

  useEffect(() => {
    (subscriber as any).onStatusUpdate = (isOnline: boolean) => {
      setDriverStatus(isOnline ? driverPresent : noDrivers);
    };
  }, [subscriber]);

  useEffect(() => {
    async function effect() {
      if (trackingId) {
        if (tracking) {
          await subscriber.stop();
        }
        subscriber.start(trackingId);
        tracking.current = false;
      }
    }

    effect();
  }, [trackingId, subscriber, tracking]);

  function onSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setTrackingId(inputText);
  }

  return (
    <header>
      <h1>
        <a href="http://ably.com/" className="logo">
          Ably
        </a>
        <span className="title">Asset Tracking</span>
      </h1>
      <div id="channel">
        <label htmlFor="channelID" className="label">
          Tracking ID:
        </label>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="channelID"
            id="channelID"
            placeholder="Enter a Channel ID"
            className="input"
            value={inputText}
            onChange={(evt) => setInputText(evt.target.value)}
          />
        </form>
        <h2 className="subscribers" id="subscriberCount">
          {driverStatus}
        </h2>
      </div>
    </header>
  );
};

export default Header;

import type { NextPage } from 'next';
import React, { FormEvent, useEffect, useState } from 'react';
import Head from 'next/head';
import { Wrapper } from '@googlemaps/react-wrapper';
import MapComponent from '../components/Map';
import Asset from '../components/Asset';
import Header, { DriverStatus } from '../components/Header';
import AssetForm from '../components/AssetForm';
import { Subscriber } from '@ably/asset-tracking';

const INITIAL_ZOOM = 3;
const MAP_CENTRE = { lat: 0, lng: 0 };
const username = process.env.NEXT_PUBLIC_USERNAME;
const password = process.env.NEXT_PUBLIC_PASSWORD;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

let AblyAssetTracking: typeof import('@ably/asset-tracking');

const Home: NextPage = () => {
  const [trackingId, setTrackingId] = useState('');
  const [orderId, setOrderId] = useState<number | null>(null);
  const [googleApiKey, setGoogleApiKey] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [startLocation, setStartLocation] = useState<[number, number]>([1, 2]);
  const [destination, setDestination] = useState<[number, number]>([3, 4]);
  const [arrived, setArrived] = useState(false);

  const completeOrder = () => {
    setArrived(true);
  };

  const onSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    const res = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      body: JSON.stringify({
        from: {
          latitude: 1,
          longitude: 2,
        },
        to: {
          latitude: 3,
          longitude: 4,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(username + ':' + password)}`,
      },
    });

    const body = await res.json();
    setGoogleApiKey(body.googleMaps.apiKey);
    setOrderId(body.orderId);
    setToken(body.ably.token);
  };

  return (
    <div>
      <Head>
        <title>Ably Asset Tracking Web Demo</title>
        <meta name="description" content="Demo customer delivery tracking app using @ably/asset-tracking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!token || !googleApiKey || !orderId ? (
        <>
          <Header />
          <form onSubmit={onSubmit} className="asset-form">
            <div className="form-input">
              <label className="label">
                Enter a trackble ID:
                <input value={trackingId} onChange={(evt) => setTrackingId(evt.target.value)} />
              </label>
            </div>
            <div className="form-input">
              <label className="label">Enter starting location:</label>
              <div>
                <LocationInput value={startLocation} onChange={(value) => setStartLocation(value)} />
              </div>
            </div>
            <div className="form-input">
              <label className="label">Enter destination location:</label>
              <div>
                <LocationInput value={destination} onChange={(value) => setDestination(value)} />
              </div>
            </div>
            <button className="submit-button" type="submit">
              Submit
            </button>
          </form>
        </>
      ) : arrived ? (
        <ArrivedView />
      ) : (
        <MapView
          name={trackingId}
          token={token}
          googleApiKey={googleApiKey}
          orderId={orderId}
          destination={{ lat: destination[0], lng: destination[1] }}
          completeOrder={completeOrder}
        />
      )}
    </div>
  );
};

interface LocationInputProps {
  value: [number, number];
  onChange: (location: [number, number]) => void;
}

const LocationInput = ({ value, onChange }: LocationInputProps) => {
  return (
    <>
      <label className="label">
        Latitude:{' '}
        <input type="number" value={value[0]} onChange={(evt) => onChange([evt.target.valueAsNumber, value[1]])} />
      </label>
      <label className="label">
        Latitude:{' '}
        <input type="number" value={value[0]} onChange={(evt) => onChange([evt.target.valueAsNumber, value[1]])} />
      </label>
    </>
  );
};

const MapView = ({
  name,
  token,
  googleApiKey,
  orderId,
  destination,
  completeOrder,
}: {
  name: string;
  googleApiKey: string;
  token: string;
  orderId: number;
  destination: google.maps.LatLngLiteral;
  completeOrder: () => void;
}) => {
  const [subscriber, setSubscriber] = useState<Subscriber>();

  useEffect(() => {
    async function createSubscriber() {
      const { Subscriber } = await import('@ably/asset-tracking');

      const subscriber = new Subscriber({
        ablyOptions: {
          token,
          authUrl: `${baseUrl}/ably`,
        },
      });

      setSubscriber(subscriber);
    }

    createSubscriber();
  }, [name]);

  if (!subscriber) return null;

  return (
    <>
      <Header>
        <DriverStatus subscriber={subscriber} />
      </Header>
      <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
        <MapComponent center={MAP_CENTRE} zoom={INITIAL_ZOOM}>
          <Asset
            subscriber={subscriber}
            name={String(orderId)}
            destination={destination}
            completeOrder={completeOrder}
          />
        </MapComponent>
      </Wrapper>
    </>
  );
};

const ArrivedView = () => {
  return (
    <>
      <Header />
      <div>Your order has arrived!</div>
    </>
  );
};

export default Home;

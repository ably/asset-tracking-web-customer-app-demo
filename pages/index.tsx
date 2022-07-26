import type { NextPage } from 'next';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Subscriber } from '@ably/asset-tracking';
import MapComponent from '../components/Map';
import Asset from '../components/Asset';
import Header from '../components/Header';

const INITIAL_ZOOM = 3;
const MAP_CENTRE = { lat: 0, lng: 0 };

const Home: NextPage = () => {
  const [subscriber, setSubscriber] = useState<Subscriber>();

  useEffect(() => {
    async function importAssetTracking() {
      const { Subscriber } = await import('@ably/asset-tracking');

      const ablyOptions = {
        key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
        clientId: 'hello',
      };

      const subscriber = new Subscriber({
        ablyOptions,
        onStatusUpdate: (isOnline) => {
          console.log({ isOnline });
        },
      });

      setSubscriber(subscriber);
    }

    importAssetTracking();
  }, []);

  return (
    <div>
      <Head>
        <title>Ably Asset Tracking Web Demo</title>
        <meta name="description" content="Demo customer delivery tracking app using @ably/asset-tracking" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {subscriber && (
        <>
          <Header subscriber={subscriber} />
          <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string}>
            <MapComponent center={MAP_CENTRE} zoom={INITIAL_ZOOM}>
              <Asset subscriber={subscriber} />
            </MapComponent>
          </Wrapper>
        </>
      )}
    </div>
  );
};

export default Home;

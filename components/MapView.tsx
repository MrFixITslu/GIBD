import React, { useState, useEffect } from 'react';
import { getMapUrl } from '../services/api';
import Spinner from './Spinner';

interface MapViewProps {
  lat: number;
  lng: number;
}

const MapView: React.FC<MapViewProps> = ({ lat, lng }) => {
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setError(null);
        const { url } = await getMapUrl(lat, lng);
        setMapUrl(url);
      } catch (e: any) {
        setError(e.message || "Could not load map.");
        console.error("Map fetch error:", e);
      }
    };
    fetchUrl();
  }, [lat, lng]);

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg h-64 flex items-center justify-center p-4 text-center">
        <p>
          Map could not be loaded.
          <br />
          <span className="text-xs">({error})</span>
        </p>
      </div>
    );
  }

  if (!mapUrl) {
    return (
      <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md border border-gray-200">
      <iframe
        title="Business Location"
        width="100%"
        height="256" // h-64
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src={mapUrl}
      ></iframe>
    </div>
  );
};

export default MapView;
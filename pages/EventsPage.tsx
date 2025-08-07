

import React from 'react';
import EventCard from '../components/EventCard';
import { useAppContext } from '../context/AppContext';

const EventsPage: React.FC = () => {
  const { t, events } = useAppContext();
  
  return (
    <div className="bg-sandy-beige min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-gray">{t('events')}</h1>
          <p className="mt-2 text-lg text-gray-600 font-noto-sans">Discover what's happening in Gros-Islet!</p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8">
          {events.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
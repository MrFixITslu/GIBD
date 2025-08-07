
import React from 'react';
import { Event } from '../types';
import { useAppContext } from '../context/AppContext';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { businesses } = useAppContext();
  const business = businesses.find(b => b.id === event.businessId);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row">
      <img className="h-48 w-full md:w-1/3 object-cover" src={event.image} alt={event.title} />
      <div className="p-6 flex flex-col justify-between">
        <div>
          <div className="tracking-wide text-sm text-sunset-orange font-bold">{event.date} &bull; {event.time}</div>
          <h3 className="block mt-1 text-xl leading-tight font-bold text-charcoal-gray hover:underline">{event.title}</h3>
          <p className="mt-2 text-gray-600">{event.description}</p>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Hosted by: <span className="font-semibold text-ocean-blue">{business?.name || 'Gros-Islet Community'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
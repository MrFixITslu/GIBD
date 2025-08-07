import React from 'react';
import { Itinerary } from '../../types';
import { ItineraryDayView } from './ItineraryDayView';

export const ItineraryDisplay: React.FC<{
    itinerary: Itinerary,
    onModify: () => void,
    t: (key: string) => string;
}> = ({ itinerary, onModify, t }) => (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg h-full flex flex-col">
        <h2 className="text-3xl font-bold text-charcoal-gray mb-4 border-b pb-4 shrink-0">{itinerary.title}</h2>
        <div className="flex-grow overflow-y-auto pr-2">
          {itinerary.schedule.map(day => <ItineraryDayView key={day.day} day={day} />)}
        </div>
        <div className="mt-6 pt-6 border-t shrink-0">
          <button
              onClick={onModify}
              className="w-full px-6 py-3 bg-ocean-blue text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors"
          >
              {t('modify_selections')}
          </button>
        </div>
    </div>
);
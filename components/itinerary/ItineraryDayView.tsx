import React from 'react';
import { ItineraryDay } from '../../types';

export const ItineraryDayView: React.FC<{ day: ItineraryDay }> = ({ day }) => (
  <div className="mb-6">
    <h3 className="text-xl font-bold text-ocean-blue">{`Day ${day.day}: ${day.title}`}</h3>
    <p className="italic text-gray-600 mb-3">{day.theme}</p>
    <div className="relative pl-5 border-l-2 border-gray-200">
      {day.items.map((item) => (
        <div key={item.id} className="relative mb-6 pl-6">
          <div className="absolute left-[-0.6rem] top-1 w-4 h-4 rounded-full border-2 border-white bg-ocean-blue"></div>
          <p className="font-bold text-sm text-tropical-green">{item.time}</p>
          <h4 className="font-semibold text-charcoal-gray">{item.activity}</h4>
          <p className="text-xs text-gray-500">{item.businessName} - {item.location}</p>
          <p className="mt-1 text-sm text-gray-700">{item.details}</p>
        </div>
      ))}
    </div>
  </div>
);
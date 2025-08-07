import React from 'react';

export const ItineraryPlaceholder: React.FC = () => (
    <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col items-center justify-center text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3m0 0l-6-4m6 4l6 3" />
        </svg>
        <h2 className="mt-4 text-2xl font-bold text-gray-500">Your Itinerary Awaits</h2>
        <p className="mt-2 text-gray-400">Chat with our guide to build your personalized plan!</p>
    </div>
);
import React from 'react';
import { ItinerarySuggestions } from '../../types';

export const SuggestionPicker: React.FC<{
  suggestions: ItinerarySuggestions;
  selectedItems: Set<string>;
  onToggleItem: (id: string) => void;
  onCreateItinerary: () => void;
  t: (key: string) => string;
}> = ({ suggestions, selectedItems, onToggleItem, onCreateItinerary, t }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg h-full flex flex-col">
            <h2 className="text-3xl font-bold text-charcoal-gray mb-4 border-b pb-4 shrink-0">{suggestions.title}</h2>
            <div className="flex-grow overflow-y-auto pr-2 space-y-6">
                {suggestions.suggestions.map(day => (
                    <div key={day.day}>
                        <h3 className="text-lg font-bold text-ocean-blue mb-2">Day {day.day}</h3>
                        <div className="space-y-3">
                            {day.options.map(item => (
                                <div key={item.id} className="relative bg-gray-50 p-4 rounded-lg border has-[:checked]:bg-tropical-green-light has-[:checked]:border-tropical-green transition-all">
                                    <label htmlFor={item.id} className="cursor-pointer block pr-8">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-tropical-green">{item.activity}</p>
                                            <span className="text-xs font-semibold uppercase text-white bg-sunset-orange px-2 py-0.5 rounded-full">{item.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-800">{item.businessName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.details}</p>
                                    </label>
                                    <input
                                        id={item.id}
                                        type="checkbox"
                                        checked={selectedItems.has(item.id)}
                                        onChange={() => onToggleItem(item.id)}
                                        className="absolute top-1/2 -translate-y-1/2 right-4 h-5 w-5 rounded border-gray-300 text-tropical-green focus:ring-tropical-green"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 pt-6 border-t shrink-0">
                <button
                    onClick={onCreateItinerary}
                    disabled={selectedItems.size === 0}
                    className="w-full px-6 py-3 bg-sunset-orange text-white font-bold rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {t('create_my_itinerary')}
                </button>
            </div>
        </div>
    );
};
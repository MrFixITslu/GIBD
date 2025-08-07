

import { Itinerary, ItinerarySuggestions, NewsArticle } from '../types';
import * as api from './api';

export const getTownInfo = async (): Promise<string> => {
    try {
        const response = await api.getTownInfo();
        return response.text;
    } catch (error) {
        console.error("Failed to fetch town info from server:", error);
        return "I'm having a trouble recalling the details right now, but I can tell you Gros-Islet is a wonderful place filled with friendly faces and beautiful beaches!";
    }
}

export const fetchCommunityNews = async (): Promise<NewsArticle[]> => {
  try {
      const news = await api.getCommunityNews();
      return news;
  } catch (error) {
      console.error("Failed to fetch community news from server:", error);
      // You might want to return a default state or an empty array on error
      return [];
  }
};

export const generateItinerarySuggestions = async (interests: string, budget: string, duration: number): Promise<ItinerarySuggestions | null> => {
  try {
      const suggestions = await api.generateItinerarySuggestions(interests, budget, duration);
      // Ensure unique IDs client-side as a fallback
      suggestions.suggestions.forEach((day:any) => {
        day.options.forEach((item:any, itemIndex:number) => {
            if (!item.id) {
                // Use a stable, predictable key instead of Math.random()
                item.id = `d${day.day}i${itemIndex}`;
            }
        });
    });
      return suggestions;
  } catch (error) {
      console.error("Failed to generate itinerary from server:", error);
      return null;
  }
};
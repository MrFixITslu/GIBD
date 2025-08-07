

import { Itinerary, ItinerarySuggestions, NewsArticle } from '../types';
import * as api from './api';

export const getTownInfo = async (): Promise<string> => {
    // API temporarily disabled - returning static content
    return "Welcome to Gros-Islet! This charming fishing village in northern St. Lucia is known for its vibrant Friday night street parties, beautiful beaches, and warm local hospitality.";
}

export const fetchCommunityNews = async (): Promise<NewsArticle[]> => {
  // API temporarily disabled - returning empty array
  return [];
};

export const generateItinerarySuggestions = async (interests: string, budget: string, duration: number): Promise<ItinerarySuggestions | null> => {
  // API temporarily disabled - returning null
  return null;
};
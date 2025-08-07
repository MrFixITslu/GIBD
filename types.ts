

export enum Language {
  EN = 'en',
  FR = 'fr',
  KW = 'kw',
}

export interface Translations {
  [key: string]: { [lang in Language]: string };
}

export enum BusinessCategory {
  RESTAURANT = 'Restaurant',
  SHOP = 'Shop',
  TOUR = 'Tour',
  BEACH_BAR = 'Beach Bar',
  ACCOMMODATION = 'Accommodation',
  ARTISAN = 'Artisan',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // In a real app, never store plain text passwords
}

export interface Business {
  id:string;
  ownerId: string;
  name: string;
  category: BusinessCategory;
  description: string;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  hours: { [key: string]: string };
  images: string[];
  rating: number;
  tags: string[];
  offers?: string;
  votes: number;
}

export type UpdatableBusinessData = Pick<Business, 'name' | 'description'>;

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  businessId: string;
  image: string;
}

export interface ItineraryItem {
  id: string; // Unique ID for each item
  time: string;
  activity: string;
  businessName: string;
  location: string;
  details: string;
}

export interface ItinerarySuggestionItem extends ItineraryItem {
  type: 'activity' | 'dining' | 'sightseeing';
}

export interface ItinerarySuggestionDay {
  day: number;
  options: ItinerarySuggestionItem[];
}

export interface ItinerarySuggestions {
    title: string;
    duration: number;
    suggestions: ItinerarySuggestionDay[];
}


export interface ItineraryDay {
  day: number;
  title: string;
  theme: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  title: string;
  duration: number;
  schedule: ItineraryDay[];
}

export interface NewsArticle {
  title: string;
  summary: string;
  url: string;
  sourceTitle: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}
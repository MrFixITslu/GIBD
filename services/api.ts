import { Business, Event, UpdatableBusinessData, User, BlogPost, ItinerarySuggestions, NewsArticle } from '../types';

// Production API URL for Netlify deployment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://gros-islet-backend.netlify.app/api';

// Import mock data for fallback
import { mockApi, mockBusinesses, mockEvents } from './mockData';

// Check if API is available
let isApiAvailable = true;

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  if (response.status === 204) { // No Content
    return;
  }
  return response.json();
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

// --- Auth ---
export const login = async (email: string, password: string): Promise<{ user: {id: string, email: string}, token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

export const register = async (email: string, password: string): Promise<{ user: {id: string, email: string}, token: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
};

// Helper function to check API availability
const checkApiAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('API not available, using mock data:', error);
    return false;
  }
};

// --- Businesses ---
export const getBusinesses = async (): Promise<Business[]> => {
  try {
    // Check if this is the first API call and test availability
    if (isApiAvailable) {
      isApiAvailable = await checkApiAvailability();
    }
    
    if (!isApiAvailable) {
      console.log('Using mock data for businesses');
      return mockApi.getBusinesses();
    }
    
    const response = await fetch(`${API_BASE_URL}/businesses`);
    return handleResponse(response);
  } catch (error) {
    console.warn('Failed to fetch businesses from API, using mock data:', error);
    isApiAvailable = false;
    return mockApi.getBusinesses();
  }
};

export const addBusiness = async (businessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'>, token: string): Promise<Business> => {
    const response = await fetch(`${API_BASE_URL}/businesses`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(businessData)
    });
    return handleResponse(response);
};

export const updateBusiness = async (businessId: string, data: UpdatableBusinessData, token: string): Promise<Business> => {
    const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify(data)
    });
    return handleResponse(response);
};

export const voteForBusiness = async (businessId: string): Promise<{ id: string; votes: number }> => {
  try {
    if (!isApiAvailable) {
      console.log('Using mock data for voting');
      await mockApi.voteForBusiness(businessId);
      const business = mockBusinesses.find(b => b.id === businessId);
      return { id: businessId, votes: business?.votes || 0 };
    }
    
    const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/vote`, {
      method: 'POST'
    });
    return handleResponse(response);
  } catch (error) {
    console.warn('Failed to vote via API, using mock data:', error);
    isApiAvailable = false;
    await mockApi.voteForBusiness(businessId);
    const business = mockBusinesses.find(b => b.id === businessId);
    return { id: businessId, votes: business?.votes || 0 };
  }
};

// --- Events ---
export const getEvents = async (): Promise<Event[]> => {
  try {
    if (!isApiAvailable) {
      console.log('Using mock data for events');
      return mockApi.getEvents();
    }
    
    const response = await fetch(`${API_BASE_URL}/events`);
    return handleResponse(response);
  } catch (error) {
    console.warn('Failed to fetch events from API, using mock data:', error);
    isApiAvailable = false;
    return mockApi.getEvents();
  }
};

export const addEvent = async (eventData: Omit<Event, 'id' | 'image'>, token: string): Promise<Event> => {
    const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(eventData),
    });
    return handleResponse(response);
};

export const deleteEvent = async (eventId: string, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(token),
    });
    return handleResponse(response);
};

// --- Content ---
export const getBlogPosts = async (): Promise<BlogPost[]> => {
    const response = await fetch(`${API_BASE_URL}/blog`);
    return handleResponse(response);
}

// --- Services ---
export const getMapUrl = async (lat: number, lng: number): Promise<{ url: string }> => {
  const response = await fetch(`${API_BASE_URL}/map-url?lat=${lat}&lng=${lng}`);
  return handleResponse(response);
};


// --- AI Services ---
export const getTownInfo = async (): Promise<{text: string}> => {
    const response = await fetch(`${API_BASE_URL}/town-info`);
    return handleResponse(response);
};

export const getCommunityNews = async (): Promise<NewsArticle[]> => {
    const response = await fetch(`${API_BASE_URL}/news`);
    return handleResponse(response);
};

export const generateItinerarySuggestions = async (interests: string, budget: string, duration: number): Promise<ItinerarySuggestions> => {
    const response = await fetch(`${API_BASE_URL}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interests, budget, duration })
    });
    return handleResponse(response);
};
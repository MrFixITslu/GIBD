import { Business, Event, UpdatableBusinessData, User, BlogPost, ItinerarySuggestions, NewsArticle } from '../types';

const API_BASE_URL = 'http://localhost:3001/api'; // In real app, use env var

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

// --- Businesses ---
export const getBusinesses = async (): Promise<Business[]> => {
  const response = await fetch(`${API_BASE_URL}/businesses`);
  return handleResponse(response);
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
  const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/vote`, {
    method: 'POST'
  });
  return handleResponse(response);
};

// --- Events ---
export const getEvents = async (): Promise<Event[]> => {
  const response = await fetch(`${API_BASE_URL}/events`);
  return handleResponse(response);
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
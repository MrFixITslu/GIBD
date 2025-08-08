import { Business, Event, UpdatableBusinessData } from '../types';

// API URL for Netlify functions
const API_BASE_URL = import.meta.env['VITE_API_URL'] || '/api';

// Remove mock data imports since we're using only real backend now

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
      
      // Handle specific error codes from our Netlify functions
      if (error.error) {
        switch (error.error) {
          case 'MISSING_DATABASE_URL':
            errorMessage = 'Database not configured. Please set NETLIFY_DATABASE_URL environment variable in your Netlify dashboard.';
            break;
          case 'DATABASE_CONNECTION_FAILED':
            errorMessage = 'Database connection failed. Please check your database configuration and credentials.';
            break;
          case 'DATABASE_AUTH_ERROR':
            errorMessage = 'Database authentication failed. Please check your database credentials.';
            break;
          case 'MISSING_TABLES':
            errorMessage = 'Database tables not found. Please run the database setup script.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
    } catch (parseError) {
      // If response is not JSON (like HTML error page), try to get text
      try {
        const text = await response.text();
        if (text.includes('<!DOCTYPE')) {
          errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}. This usually means the API endpoint doesn't exist or the server is not running.`;
        } else if (text.includes('Function invocation failed')) {
          errorMessage = `Serverless function error: The backend function failed to execute. This could be due to missing environment variables or database connection issues.`;
        } else if (text.includes('Database connection not configured')) {
          errorMessage = `Database not configured. Please set up the database connection in your Netlify environment variables.`;
        } else if (text.includes('Database connection failed')) {
          errorMessage = `Database connection failed. Please check your database configuration and credentials.`;
        } else {
          errorMessage = `Server error: ${text.substring(0, 100)}...`;
        }
      } catch (textError) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) { // No Content
    return;
  }
  
  try {
    return response.json();
  } catch (parseError) {
    throw new Error('Invalid JSON response from server');
  }
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
});

// --- Auth ---
export const login = async (email: string, password: string): Promise<{ user: {id: string, email: string}, token: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

export const register = async (email: string, password: string): Promise<{ user: {id: string, email: string}, token: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};



// --- Businesses ---
export const getBusinesses = async (): Promise<Business[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses`);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

export const addBusiness = async (businessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'>, token: string): Promise<Business> => {
    try {
      const response = await fetch(`${API_BASE_URL}/businesses`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(businessData)
      });
      return handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
};

export const updateBusiness = async (businessId: string, data: UpdatableBusinessData, token: string): Promise<Business> => {
    try {
      const response = await fetch(`${API_BASE_URL}/businesses/${businessId}`, {
          method: 'PUT',
          headers: getAuthHeaders(token),
          body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
};

export const voteForBusiness = async (businessId: string): Promise<{ id: string; votes: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/businesses/${businessId}/vote`, {
      method: 'POST'
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

// --- Events ---
export const getEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

export const addEvent = async (eventData: Omit<Event, 'id' | 'image'>, token: string): Promise<Event> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify(eventData),
      });
      return handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
};

export const deleteEvent = async (eventId: string, token: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(token),
      });
      return handleResponse(response);
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
      }
      throw error;
    }
};

// --- Additional Services (to be implemented later if needed) ---
// These functions can be added back when you implement the corresponding Netlify functions:
// - getBlogPosts
// - getMapUrl  
// - getTownInfo
// - getCommunityNews
// - generateItinerarySuggestions
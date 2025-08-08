import { Business, Event, UpdatableBusinessData } from '../types';
import { logger } from '../utils/logger';

// API URL for Netlify functions with fallback
const API_BASE_URL = import.meta.env['VITE_API_URL'] || '/api';

// Request timeout configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

// Enhanced fetch with timeout and retry logic
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Retry logic for failed requests
const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> => {
  try {
    return await fetchWithTimeout(url, options);
  } catch (error) {
    if (retries > 0 && error instanceof Error) {
      // Retry on network errors but not on 4xx errors
      if (error.name === 'AbortError' || error.name === 'TypeError') {
        logger.warn(`Request failed, retrying... ${retries} attempts left`, { url, error: error.message });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        return fetchWithRetry(url, options, retries - 1);
      }
    }
    throw error;
  }
};

const handleResponse = async (response: Response | null): Promise<any> => {
  // CRITICAL: Check if response exists
  if (!response) {
    throw new Error('Network error: No response received from server');
  }
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const contentType = response.headers.get('content-type');
      
      // Check if response is JSON before trying to parse
      if (contentType && contentType.includes('application/json')) {
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
      } else {
        // Handle non-JSON responses (HTML error pages)
        const text = await response.text();
        if (text.includes('<!DOCTYPE')) {
          errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}. This usually means the API endpoint doesn't exist or there's a routing issue in Netlify.`;
        } else if (text.includes('Function invocation failed')) {
          errorMessage = `Netlify function error: The serverless function failed to execute. Check environment variables and function configuration.`;
        } else if (text.includes('Database connection not configured')) {
          errorMessage = `Database not configured. Please set up the database connection in your Netlify environment variables.`;
        } else if (text.includes('Database connection failed')) {
          errorMessage = `Database connection failed. Please check your database configuration and credentials.`;
        } else if (response.status === 404) {
          errorMessage = `API endpoint not found (404). Check if Netlify functions are deployed correctly.`;
        } else if (response.status === 503) {
          errorMessage = `Service unavailable (503). Netlify functions might be failing to start.`;
        } else {
          errorMessage = `Server error: ${text.substring(0, 100)}...`;
        }
      }
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}. Failed to parse error response.`;
    }
    
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) { // No Content
    return;
  }
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      throw new Error(`Expected JSON response but got ${contentType}`);
    }
  } catch (parseError) {
    throw new Error('Invalid JSON response from server');
  }
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    // Security headers
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache',
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
    logger.debug('Fetching businesses from:', `${API_BASE_URL}/businesses`);
    const response = await fetchWithRetry(`${API_BASE_URL}/businesses`);
    const data = await handleResponse(response);
    
    // CRITICAL: Validate response data structure
    if (!Array.isArray(data)) {
      logger.warn('Businesses API returned non-array data:', data);
      return []; // Return empty array instead of crashing
    }
    
    // Validate each business object
    const validBusinesses = data.filter((business: any) => {
      return business && 
             typeof business.id === 'string' && 
             typeof business.name === 'string' &&
             business.category &&
             business.contact;
    });
    
    if (validBusinesses.length !== data.length) {
      logger.warn(`Filtered out ${data.length - validBusinesses.length} invalid business objects`);
    }
    
    return validBusinesses as Business[];
  } catch (error) {
    logger.error('Failed to fetch businesses:', error);
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
    logger.debug('Fetching events from:', `${API_BASE_URL}/events`);
    const response = await fetchWithRetry(`${API_BASE_URL}/events`);
    const data = await handleResponse(response);
    
    // CRITICAL: Validate response data structure
    if (!Array.isArray(data)) {
      logger.warn('Events API returned non-array data:', data);
      return []; // Return empty array instead of crashing
    }
    
    // Validate each event object
    const validEvents = data.filter((event: any) => {
      return event && 
             typeof event.id === 'string' && 
             typeof event.title === 'string' &&
             typeof event.date === 'string' &&
             typeof event.businessId === 'string';
    });
    
    if (validEvents.length !== data.length) {
      logger.warn(`Filtered out ${data.length - validEvents.length} invalid event objects`);
    }
    
    return validEvents as Event[];
  } catch (error) {
    logger.error('Failed to fetch events:', error);
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
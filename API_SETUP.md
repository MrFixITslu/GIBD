# API Setup Guide

## Current Status
✅ **CORS Fixed** - Your production site can now connect to the backend  
❌ **API Key Missing** - Gemini API key needs to be set for AI features

## How to Fix API Key Error

### Option 1: Get a Real API Key (Recommended)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key
4. In your backend `.env` file, replace:
   ```
   API_KEY=your-gemini-api-key
   ```
   with:
   ```
   API_KEY=AIzaSyC...your-actual-key-here
   ```
5. Restart your backend server

### Option 2: Use Without AI Features (Temporary)
The app will work without the API key, but AI features will show fallback data:
- News page will show static articles
- Town info will show a default description
- Itinerary planner will show mock suggestions

## Test the Fix
1. Set the API key in your `.env` file
2. Restart the backend: `npm run dev:server`
3. Check the logs for: "GoogleGenAI service initialized successfully"
4. Visit your site and test the News page

## For Production Deployment
When deploying your backend to Railway/Render/VPS:
1. Set the `API_KEY` environment variable with your real key
2. The app will work with full AI features

## Current Error Explained
The error `"API key not valid"` occurs because:
- The default value `"your-gemini-api-key"` is not a real API key
- Google's API rejects it, causing a 500 error
- The news endpoint fails and shows the error

Once you set a real API key, this error will disappear and AI features will work properly.



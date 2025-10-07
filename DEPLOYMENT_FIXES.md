# Deployment Fixes Guide

## Current Issues Fixed:

### 1. ✅ Package.json Postinstall Script
- **Problem**: `"postinstall": "npm audit fix --force"` was causing build failures
- **Solution**: Removed the problematic postinstall script
- **Status**: Fixed

### 2. ✅ Package-lock.json Sync Issue
- **Problem**: `package-lock.json` was out of sync with `package.json`, causing `npm ci` to fail
- **Solution**: Cleaned and reinstalled dependencies to regenerate `package-lock.json`
- **Status**: Fixed

### 3. ✅ API URL Configuration
- **Problem**: `VITE_API_URL=http://localhost:3001/api` won't work in production
- **Solution**: Changed to `VITE_API_URL=/api` for Netlify functions
- **Status**: Fixed

### 4. ✅ Improved Error Handling
- **Problem**: Generic error messages not helpful for debugging
- **Solution**: Added specific error detection for HTML responses and function failures
- **Status**: Fixed

### 5. ✅ Enhanced CORS Configuration
- **Problem**: Basic CORS headers missing Authorization support
- **Solution**: Added Authorization header and proper Content-Type
- **Status**: Fixed

## Required Environment Variables for Netlify:

### Step 1: Set up Database
1. Go to [Neon](https://neon.tech) and create a free PostgreSQL database
2. Copy your database connection string
3. In Netlify dashboard → Site Settings → Environment Variables, add:
   ```
   NETLIFY_DATABASE_URL=postgresql://username:password@your-neon-host/your-database-name
   ```

### Step 2: Set up Authentication
1. Generate a secure JWT secret (32+ characters)
2. In Netlify dashboard → Site Settings → Environment Variables, add:
   ```
   JWT_SECRET=your-super-secure-jwt-secret-key-32-characters-minimum
   ```

### Step 3: Optional API Keys (for AI features)
1. Get a Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. In Netlify dashboard → Site Settings → Environment Variables, add:
   ```
   API_KEY=your-gemini-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   ```

## Database Setup:

### Step 1: Create Database Tables
Run this SQL in your Neon database:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    contact JSONB,
    location VARCHAR(255),
    coordinates JSONB,
    hours JSONB,
    images TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    votes INTEGER DEFAULT 0,
    tags TEXT[],
    offers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_date ON events(date);
```

## Testing the Fix:

### 1. Deploy to Netlify
1. Commit and push your changes
2. Netlify will automatically rebuild
3. Check the build logs for any errors

### 2. Test the Application
1. Visit your Netlify site
2. Open browser DevTools → Network tab
3. Check if API calls to `/api/businesses` return JSON (not HTML)
4. Look for any error messages in the console

### 3. Common Issues and Solutions:

#### Issue: "Database connection not configured"
- **Solution**: Set `NETLIFY_DATABASE_URL` in Netlify environment variables

#### Issue: "JWT_SECRET is not configured"
- **Solution**: Set `JWT_SECRET` in Netlify environment variables

#### Issue: Still getting HTML responses
- **Solution**: Check that all Netlify functions are properly deployed and environment variables are set

#### Issue: CORS errors
- **Solution**: The CORS headers are now properly configured in the functions

## Browser Extension Error:
The `inpage.js` error is from a crypto wallet extension (Binance) and is unrelated to your application. To avoid this:
1. Disable crypto wallet extensions for your site
2. Or use Incognito mode with extensions disabled

## Next Steps:
1. Set up the environment variables in Netlify
2. Create the database tables
3. Deploy and test
4. Monitor the application for any remaining issues

## Files Modified:
- ✅ `package.json` - Removed postinstall script
- ✅ `package-lock.json` - Regenerated to sync with package.json
- ✅ `env.production` - Fixed API URL
- ✅ `services/api.ts` - Improved error handling
- ✅ `netlify/functions/businesses-get.ts` - Enhanced CORS and error handling

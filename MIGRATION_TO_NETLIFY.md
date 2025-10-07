# Migration to Netlify + Neon Database

This project has been migrated from using a separate Express.js backend server to Netlify Functions with a Neon PostgreSQL database.

## What Changed

### Removed Files
- `server.ts` - The Express.js backend server (moved to `backup/server.ts`)
- `components/ui/MockDataBanner.tsx` - Demo mode banner component
- Various mock data fallbacks in the API service

### Added Files
- `netlify/functions/` - Directory containing Netlify Functions that replace the Express.js endpoints
- `database-schema.sql` - SQL schema for the Neon database
- `env.netlify.example` - Environment variables needed for Netlify deployment

### Updated Files
- `services/api.ts` - Updated to call Netlify Functions instead of Express endpoints
- `context/AppContext.tsx` - Removed demo mode detection logic
- `package.json` - Added Netlify dependencies, removed Express dependencies
- `netlify.toml` - Updated with function redirects and build configuration

## Netlify Functions

The following API endpoints are now handled by Netlify Functions:

- `POST /api/auth/login` → `auth-login.ts`
- `POST /api/auth/register` → `auth-register.ts`
- `GET /api/businesses` → `businesses-get.ts`
- `POST /api/businesses` → `businesses-create.ts`
- `PUT /api/businesses/:id` → `businesses-update.ts`
- `POST /api/businesses/:id/vote` → `businesses-vote.ts`
- `GET /api/events` → `events-get.ts`
- `POST /api/events` → `events-create.ts`
- `DELETE /api/events/:id` → `events-delete.ts`

## Database Setup

1. Create a Neon database
2. Run the SQL commands in `database-schema.sql`
3. Set the `NETLIFY_DATABASE_URL` environment variable in Netlify

## Environment Variables

Required environment variables in Netlify:
- `NETLIFY_DATABASE_URL` - Your Neon database connection string
- `JWT_SECRET` - Secret key for JWT tokens (32+ characters)

Optional (for AI features):
- `API_KEY` - Google Gemini API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

## Deployment

The app is now configured for automatic deployment to Netlify:

1. Connect your GitHub repository to Netlify
2. Netlify will use the build settings from `netlify.toml`
3. Set the required environment variables in the Netlify dashboard
4. Deploy!

## Benefits of This Migration

- **Serverless**: No need to manage a separate server
- **Scalable**: Netlify Functions scale automatically
- **Cost-effective**: Pay only for actual usage
- **Integrated**: Frontend and backend deployed together
- **Reliable**: Uses Neon's managed PostgreSQL database

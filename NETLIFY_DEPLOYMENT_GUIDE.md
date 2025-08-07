# Netlify Deployment Guide

This guide will help you deploy the Gros Islet Business Directory using Netlify Functions and a Neon PostgreSQL database.

## Prerequisites

1. A Netlify account
2. A Neon database account
3. Your code repository on GitHub

## Step 1: Set Up Neon Database

1. Go to [Neon](https://neon.tech) and create a new project
2. Create a database (you can use the default database)
3. Copy your connection string (it looks like: `postgresql://username:password@hostname/database`)
4. Run the SQL commands from `database-schema.sql` in your Neon SQL Editor to create the tables

## Step 2: Deploy to Netlify

### Option A: GitHub Integration (Recommended)

1. Go to [Netlify](https://netlify.com) and sign in
2. Click "New site from Git"
3. Connect your GitHub repository
4. Netlify will automatically detect the build settings from `netlify.toml`
5. Deploy the site

### Option B: Manual Deploy

1. Build the project locally:
   ```bash
   npm install
   npm run build
   ```
2. Drag and drop the `dist` folder to Netlify's deploy area

## Step 3: Configure Environment Variables

In your Netlify site dashboard, go to **Site Settings → Environment Variables** and add:

### Required Variables
- `NETLIFY_DATABASE_URL`: Your Neon database connection string
  ```
  postgresql://username:password@hostname/database?sslmode=require
  ```
- `JWT_SECRET`: A secure random string (32+ characters)
  ```
  your-super-secure-jwt-secret-key-minimum-32-characters
  ```

### Optional Variables (for AI features)
- `API_KEY`: Your Google Gemini API key
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Step 4: Test Your Deployment

1. Visit your deployed site
2. Try registering a new user
3. Try adding a business or event
4. Verify data is being stored in your Neon database

## Database Sample Data

The `database-schema.sql` file includes some sample data to get you started. You can modify or remove this data as needed.

## Troubleshooting

### Common Issues

1. **500 errors on API calls**: Check that your `NETLIFY_DATABASE_URL` is correctly set
2. **Authentication not working**: Ensure `JWT_SECRET` is set and is at least 32 characters
3. **Database connection errors**: Verify your Neon database is running and the connection string is correct

### Checking Logs

1. Go to your Netlify site dashboard
2. Navigate to **Functions** tab
3. Click on any function to see its logs
4. Check for error messages

### Testing Functions Locally

You can test your functions locally using the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev
```

## API Endpoints

Your deployed app will have these API endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create new business (auth required)
- `PUT /api/businesses/:id` - Update business (auth required)
- `POST /api/businesses/:id/vote` - Vote for business
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)

## Next Steps

- Set up monitoring with Netlify Analytics
- Configure domain and SSL
- Set up continuous deployment
- Add more features using additional Netlify Functions

## Support

For issues related to:
- Netlify deployment: Check [Netlify documentation](https://docs.netlify.com)
- Neon database: Check [Neon documentation](https://neon.tech/docs)
- This application: Create an issue in the GitHub repository

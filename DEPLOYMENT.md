# Deployment Guide

## Frontend Deployment (Netlify)

### 1. Automatic Deployment
- Connect your GitHub repository to Netlify
- Netlify will automatically detect the build settings from `netlify.toml`
- The build command is: `npm install --legacy-peer-deps && npm run build`
- The publish directory is: `dist`

### 2. Environment Variables
Set these environment variables in Netlify:
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend-domain.com/api`)

### 3. Manual Deployment
```bash
# Build the project
npm run build

# Deploy the dist/ folder to your hosting provider
```

## Backend Deployment

### Option 1: Railway/Render (Recommended)
1. Connect your GitHub repository
2. Set environment variables:
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secure-jwt-secret`
   - `API_KEY=your-gemini-api-key`
   - `GOOGLE_MAPS_API_KEY=your-google-maps-api-key`
   - `CORS_ORIGIN=https://your-frontend-domain.netlify.app`

### Option 2: Docker Deployment
```bash
# Build the Docker image
docker build -t gibd-app .

# Run the container
docker run -p 3001:3001 -e NODE_ENV=production gibd-app
```

### Option 3: VPS Deployment
1. Upload your code to a VPS
2. Install Node.js 18+
3. Run: `npm install --production`
4. Set environment variables
5. Start with: `npm start`

## Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Backend (.env)
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_EXPIRES_IN=24h
API_KEY=your-gemini-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://your-frontend-domain.netlify.app
```

## Security Checklist

- [ ] JWT_SECRET is at least 32 characters long
- [ ] All API keys are set securely
- [ ] CORS_ORIGIN points to your frontend domain
- [ ] HTTPS is enabled
- [ ] Environment variables are not committed to git

## Troubleshooting

### Build Errors
- Use `--legacy-peer-deps` for npm install
- Ensure Node.js version is 18+

### CORS Errors
- Check that CORS_ORIGIN matches your frontend domain exactly
- Include protocol (https://) in the CORS_ORIGIN

### API Connection Errors
- Verify VITE_API_URL is correct
- Ensure backend is running and accessible
- Check firewall settings

## Performance Optimization

### Frontend
- Enable gzip compression
- Use CDN for static assets
- Implement code splitting

### Backend
- Enable compression middleware
- Use connection pooling for database
- Implement caching strategies

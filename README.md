# Gros-Islet Business Directory (GIBD)

A comprehensive business directory and tourism platform for Gros-Islet, St. Lucia. Built with React, TypeScript, and Express.js, featuring AI-powered itinerary planning and business management capabilities.

## 🚀 Features

- **Business Directory**: Complete listing of local businesses with categories, ratings, and contact information
- **AI-Powered Itinerary Planning**: Personalized trip planning using Google Gemini AI
- **Event Management**: Business owners can create and manage events
- **Multi-language Support**: English, French, and Kweyol (St. Lucian Creole)
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Live business information and community voting
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Vite** for build tooling

### Backend
- **Express.js** with TypeScript
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Google Gemini AI** for intelligent features
- **Winston** for logging
- **Helmet** for security headers
- **Express Rate Limit** for API protection

### Development Tools
- **ESLint** for code linting
- **Vitest** for testing
- **TypeScript** for type safety

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key (optional, for AI features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gros-islet-business-directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your configuration
# Required variables:
# - JWT_SECRET (32+ characters)
# - API_KEY (Google Gemini API key, optional)
# - GOOGLE_MAPS_API_KEY (optional)
```

### 4. Start Development Servers

**Option A: Start both frontend and backend**
```bash
npm run dev
```

**Option B: Start servers separately**
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend  
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix
```

## 🏗️ Building for Production

```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
├── components/          # Reusable React components
├── pages/              # Page components
├── context/            # React context providers
├── services/           # API service functions
├── types/              # TypeScript type definitions
├── data/               # Mock data and constants
├── config/             # Server configuration
├── middleware/         # Express middleware
├── utils/              # Utility functions
├── server.ts           # Express server entry point
├── App.tsx             # Main React component
└── index.tsx           # React entry point
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | No | development |
| `PORT` | Server port | No | 3001 |
| `JWT_SECRET` | Secret for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT token expiration | No | 24h |
| `API_KEY` | Google Gemini API key | No | - |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | No | - |
| `LOG_LEVEL` | Logging level | No | info |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | No | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | No | 100 |
| `CORS_ORIGIN` | CORS allowed origin | No | http://localhost:5173 |

### Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection
- **Input Validation**: Request sanitization
- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Businesses
- `GET /api/businesses` - Get all businesses
- `POST /api/businesses` - Create business (protected)
- `PUT /api/businesses/:id` - Update business (protected)
- `POST /api/businesses/:id/vote` - Vote for business

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### AI Services
- `POST /api/itinerary` - Generate itinerary suggestions
- `GET /api/town-info` - Get town information
- `GET /api/news` - Get community news

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Connect your repository to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Connect your GitHub repository
   - Netlify will automatically detect the build settings from `netlify.toml`

2. **Set Environment Variables in Netlify**
   - Go to Site settings > Environment variables
   - Add `VITE_API_URL` with your backend server URL
   - Example: `https://your-backend-domain.com/api`

3. **Deploy**
   - Netlify will automatically build and deploy on every push to main branch
   - The build command is: `npm run build`
   - The publish directory is: `dist`

### Backend Deployment (Railway/Render/Heroku)

1. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Deploy to Render**
   - Connect your repository to Render
   - Set build command: `npm install && npm run build`
   - Set start command: `node dist/server.js`
   - Add environment variables in Render dashboard

3. **Environment Variables for Backend**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secure-jwt-secret-32-chars-min
   API_KEY=your-gemini-api-key
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   CORS_ORIGIN=https://your-frontend-domain.netlify.app
   ```

### Docker Deployment

```bash
# Build the Docker image
docker build -t gibd-app .

# Run the container
docker run -p 3001:3001 -e NODE_ENV=production gibd-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@gibd.com or create an issue in this repository.

## 🔮 Roadmap

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real-time notifications
- [ ] Advanced search and filtering
- [ ] Business analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Social media integration

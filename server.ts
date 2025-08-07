/**
 * Gros-Islet Business Directory (GIBD) Backend Server
 *
 * This Node.js server, built with Express, serves as the central API for the GIBD web application.
 * It manages business and event data, handles user authentication, and integrates with the
 * Google Gemini & Imagen APIs for AI-powered features like geocoding, image generation,
 * news aggregation, and personalized itinerary planning.
 *
 * Key Technologies:
 * - Express.js: Web application framework for Node.js
 * - TypeScript: Statically typed superset of JavaScript
 * - JSON Web Tokens (JWT): For secure user authentication
 * - @google/genai: Node.js SDK for the Gemini API
 * - Winston: Production logging
 * - Helmet: Security headers
 * - Express Rate Limit: Rate limiting
 * - Express Validator: Input validation
 *
 * To run this server:
 * 1. Install dependencies: `npm install`
 * 2. Copy env.example to .env and configure environment variables
 * 3. Run with: `npm run dev:server` (development) or `npm start` (production)
 */

// --- IMPORTS ---
import express, { Request, Response, NextFunction, Router } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { GoogleGenAI } from '@google/genai';
import { mockBusinesses, mockEvents, mockBlogPosts } from './data/mockData';
import { Business, Event, User, UpdatableBusinessData, ItinerarySuggestions, BlogPost, NewsArticle } from './types';
import { config, isDevelopment } from './config/server';
import logger from './utils/logger';
import {
  validateLogin,
  validateRegister,
  validateBusinessCreate,
  validateBusinessUpdate,
  validateEventCreate,
  validateItineraryRequest,
  validateId
} from './middleware/validation';

// --- CONFIGURATION & CONSTANTS ---
const app = express();
const PORT = config.PORT;

// Model Names
const GEMINI_FLASH_MODEL = 'gemini-2.5-flash-preview-04-17';
const IMAGEN_MODEL = 'imagen-3.0-generate-002';

// Security configuration
const JWT_SECRET = config.JWT_SECRET;
const API_KEY = config.API_KEY;
const GOOGLE_MAPS_API_KEY = config.GOOGLE_MAPS_API_KEY;


// --- AI SERVICE INITIALIZATION ---
let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
    logger.info("GoogleGenAI service initialized successfully.");
} else {
    logger.warn("⚠️  Gemini API_KEY not set on server. AI-powered endpoints will not function.");
}

// --- IN-MEMORY DATABASE (FOR DEVELOPMENT) ---
// In a production environment, this should be replaced with a robust database like PostgreSQL or MongoDB,
// and data access should be handled through a dedicated data layer (e.g., repositories with an ORM like TypeORM or Prisma).
let businesses: Business[] = JSON.parse(JSON.stringify(mockBusinesses));
let events: Event[] = JSON.parse(JSON.stringify(mockEvents));
let blogPosts: BlogPost[] = JSON.parse(JSON.stringify(mockBlogPosts));

// Initialize users with properly hashed passwords
const initializeUsers = async (): Promise<User[]> => {
    const userData = [
        { id: 'user-1', email: 'owner1@example.com', password: 'SecurePass123!' },
        { id: 'user-2', email: 'owner2@example.com', password: 'SecurePass123!' },
        { id: 'user-3', email: 'owner3@example.com', password: 'SecurePass123!' },
        { id: 'user-4', email: 'owner4@example.com', password: 'SecurePass123!' },
        { id: 'user-5', email: 'owner5@example.com', password: 'SecurePass123!' },
        { id: 'user-6', email: 'owner6@example.com', password: 'SecurePass123!' },
    ];

    return Promise.all(userData.map(async (user) => ({
        id: user.id,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, 12)
    })));
};

let users: User[] = [];

// --- MIDDLEWARE SETUP ---
// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS configuration
const configuredOrigins = config.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean);

const isAllowedOrigin = (origin: string | undefined): boolean => {
    if (!origin) return true; // allow non-browser tools
    try {
        const url = new URL(origin);
        const hostname = url.hostname;
        const port = url.port;

        // Always allow configured exact origins
        if (configuredOrigins.includes(origin)) return true;

        // Allow common local dev patterns
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
        if (isLocalhost) return true;

        // Allow any Netlify preview/production subdomain
        if (hostname.endsWith('.netlify.app')) return true;

        // Allow your specific production domain
        if (hostname === 'v79sl.online') return true;

        // Allow any subdomain of your domain
        if (hostname.endsWith('.v79sl.online')) return true;

        // Optionally allow any http(s) with configured hostname regardless of port
        for (const allowed of configuredOrigins) {
            try {
                const allowedUrl = new URL(allowed);
                if (allowedUrl.hostname === hostname) return true;
            } catch { /* ignore */ }
        }

        return false;
    } catch {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            logger.info(`CORS allowed request from origin: ${origin}`);
            return callback(null, true);
        }
        logger.error(`CORS blocked request from origin: ${origin}. Configured origins: ${configuredOrigins.join(', ')}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: {
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


// Augment Express's Request type to include the authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: { id: string };
        }
    }
}

/**
 * Authentication middleware to protect routes.
 * Verifies the JWT from the Authorization header.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn(`Authentication failed: No token provided from IP ${req.ip}`);
        return res.status(401).json({ message: 'Authentication required: No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.user = { id: payload.userId };
        next();
    } catch (error) {
        logger.warn(`Authentication failed: Invalid token from IP ${req.ip}`);
        return res.status(403).json({ message: 'Authentication failed: Invalid token.' });
    }
};


// --- HELPER FUNCTIONS ---
/**
 * Safely parses a JSON string returned from the Gemini API,
 * which might be wrapped in markdown code fences (```json ... ```).
 * @param {string} responseText - The raw text response from Gemini.
 * @returns {any} The parsed JSON object or array.
 * @throws {Error} If the string cannot be parsed as JSON.
 */
const parseGeminiJsonResponse = (responseText: string): any => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", jsonStr);
        throw new Error("AI returned a malformed JSON response.");
    }
};


// --- API ROUTERS ---

// ======== Auth Router ========
const authRouter = Router();

/**
 * POST /api/auth/register
 * Registers a new user.
 */
authRouter.post('/register', validateRegister, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        
        const passwordHash = await bcrypt.hash(password, 12);
        const newUser: User = { id: `user-${Date.now()}`, email, passwordHash };
        users.push(newUser);

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
        logger.info(`New user registered: ${email}`);
        res.status(201).json({ user: { id: newUser.id, email: newUser.email }, token });
    } catch(error) {
        logger.error('Registration error:', error);
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Logs in an existing user.
 */
authRouter.post('/login', validateLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            logger.warn(`Login attempt with non-existent email: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials. Please try again.' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (isValidPassword) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN });
            logger.info(`User logged in: ${email}`);
            res.json({ user: { id: user.id, email: user.email }, token });
        } else {
            logger.warn(`Login attempt with invalid password for email: ${email}`);
            res.status(401).json({ message: 'Invalid credentials. Please try again.' });
        }
    } catch(error) {
        logger.error('Login error:', error);
        next(error);
    }
});


// ======== Business Router ========
const businessRouter = Router();

/**
 * GET /api/businesses
 * Retrieves a list of all businesses. Public endpoint.
 */
businessRouter.get('/', (req, res) => {
    res.json(businesses);
});

/**
 * POST /api/businesses
 * Creates a new business. Protected endpoint.
 * AI-enhanced: Geocodes address and generates an image if not provided.
 */
businessRouter.post('/', authMiddleware, validateBusinessCreate, async (req, res, next) => {
    try {
        const businessData: Omit<Business, 'id' | 'rating' | 'votes' | 'ownerId'> = req.body;
        const ownerId = req.user!.id;
        let enhancedData = { ...businessData };

        if (ai) {
            // AI Enhancement 1: Geocode address if coordinates are missing
            if (!enhancedData.coordinates && enhancedData.location) {
                try {
                    const geocodePrompt = `Given the location in Gros-Islet, St. Lucia: "${enhancedData.location}". Return ONLY a JSON object with "lat" and "lng" keys.`;
                    const geocodeResponse = await ai.models.generateContent({ model: GEMINI_FLASH_MODEL, contents: geocodePrompt, config: { responseMimeType: "application/json" } });
                    const coords = parseGeminiJsonResponse(geocodeResponse.text);
                    if (coords.lat && coords.lng) enhancedData.coordinates = coords;
                } catch (e) {
                    logger.error("AI Geocoding failed, continuing without coordinates:", e);
                }
            }

            // AI Enhancement 2: Generate image if a placeholder is used
            const isPlaceholderImage = enhancedData.images.some(img => img.includes('new-business-default'));
            if (isPlaceholderImage) {
                try {
                    const imageGenPrompt = `A vibrant, professional photo for a business profile. It's a ${enhancedData.category} called "${enhancedData.name}" in Gros-Islet, St. Lucia. Description: "${enhancedData.description}". The image should look appealing to tourists.`;
                    const imageResponse = await ai.models.generateImages({
                        model: IMAGEN_MODEL,
                        prompt: imageGenPrompt,
                        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
                    });
                    if (imageResponse.generatedImages?.length > 0) {
                        const imageUrl = `data:image/jpeg;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
                        enhancedData.images[0] = imageUrl; // Replace placeholder
                    }
                } catch (e) {
                    logger.error("AI Image Generation failed, continuing with placeholder:", e);
                }
            }
        }
        
        const newBusiness: Business = {
          ...enhancedData,
          id: `business-${Date.now()}`,
          ownerId,
          rating: 4.0 + Math.random(),
          votes: 1,
          hours: enhancedData.hours || { 'Mon-Sun': 'Not specified' }
        };
        businesses.unshift(newBusiness);
        logger.info(`New business created: ${newBusiness.name} by user ${ownerId}`);
        res.status(201).json(newBusiness);
    } catch (error) {
        logger.error('Business creation error:', error);
        next(error);
    }
});

/**
 * PUT /api/businesses/:id
 * Updates an existing business profile. Protected endpoint.
 */
businessRouter.put('/:id', authMiddleware, validateBusinessUpdate, (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedData: UpdatableBusinessData = req.body;
        const businessIndex = businesses.findIndex(b => b.id === id);

        if (businessIndex === -1) {
            return res.status(404).json({ message: 'Business not found.' });
        }
        if (businesses[businessIndex].ownerId !== req.user!.id) {
            logger.warn(`Unauthorized business update attempt: user ${req.user!.id} tried to update business ${id}`);
            return res.status(403).json({ message: 'You are not authorized to update this business.' });
        }

        businesses[businessIndex] = { ...businesses[businessIndex], ...updatedData };
        logger.info(`Business updated: ${businesses[businessIndex].name} by user ${req.user!.id}`);
        res.json(businesses[businessIndex]);
    } catch(error) {
        logger.error('Business update error:', error);
        next(error);
    }
});

/**
 * POST /api/businesses/:id/vote
 * Increments the vote count for a business. Public endpoint.
 */
businessRouter.post('/:id/vote', validateId, (req, res, next) => {
    try {
        const { id } = req.params;
        const businessIndex = businesses.findIndex(b => b.id === id);
        if (businessIndex > -1) {
            businesses[businessIndex].votes += 1;
            logger.info(`Vote cast for business: ${businesses[businessIndex].name} (ID: ${id})`);
            res.json({ id, votes: businesses[businessIndex].votes });
        } else {
            res.status(404).json({ message: 'Business not found.' });
        }
    } catch(error) {
        logger.error('Vote error:', error);
        next(error);
    }
});


// ======== Event Router ========
const eventRouter = Router();

/**
 * GET /api/events
 * Retrieves a list of all events. Public endpoint.
 */
eventRouter.get('/', (req, res) => {
    res.json(events);
});

/**
 * POST /api/events
 * Creates a new event for a business. Protected endpoint.
 */
eventRouter.post('/', authMiddleware, validateEventCreate, (req, res, next) => {
    try {
        const { title, date, time, description, businessId } = req.body;
        const business = businesses.find(b => b.id === businessId);
        if (!business || business.ownerId !== req.user!.id) {
            return res.status(403).json({ message: 'You can only add events for your own business.' });
        }

        const newEvent: Event = {
            id: `event-${Date.now()}`,
            image: `https://picsum.photos/seed/event${Date.now()}/800/600`, // Unique placeholder
            ...req.body
        };
        events.unshift(newEvent);
        res.status(201).json(newEvent);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/events/:id
 * Deletes an event. Protected endpoint.
 */
eventRouter.delete('/:id', authMiddleware, (req, res, next) => {
    try {
        const { id } = req.params;
        const eventIndex = events.findIndex(e => e.id === id);
        if (eventIndex === -1) {
            return res.status(404).json({ message: 'Event not found.' });
        }
        
        const business = businesses.find(b => b.id === events[eventIndex].businessId);
        if (!business || business.ownerId !== req.user!.id) {
            return res.status(403).json({ message: 'You are not authorized to delete this event.' });
        }

        events.splice(eventIndex, 1);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

// ======== Content & Services Router ========
const servicesRouter = Router();

/**
 * GET /api/blog
 * Retrieves blog posts.
 */
servicesRouter.get('/blog', (req, res) => {
    res.json(blogPosts);
});

/**
 * GET /api/map-url
 * Provides an embeddable Google Maps URL.
 */
servicesRouter.get('/map-url', (req, res) => {
    const { lat, lng } = req.query;
    if (!GOOGLE_MAPS_API_KEY) {
        return res.status(503).json({ message: "Maps service is not configured on the server." });
    }
    const url = `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${lat},${lng}&zoom=15`;
    res.json({ url });
});

/**
 * GET /api/town-info
 * AI-powered: Gets a brief, friendly description of Gros-Islet.
 */
servicesRouter.get('/town-info', async (req, res, next) => {
    if (!ai) {
        return res.json({ text: "Gros-Islet is famous for its Friday Night Street Party, where locals and visitors enjoy amazing food and music. It's the heart of our community's vibrant culture!" });
    }
    try {
        const prompt = `You are a friendly tour guide for Gros-Islet, St. Lucia. A visitor asked to learn about the town. Provide a warm, concise response (3-4 sentences) sharing an interesting fact about its culture or history.`;
        const response = await ai.models.generateContent({ model: GEMINI_FLASH_MODEL, contents: prompt });
        res.json({ text: response.text });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/news
 * AI-powered: Fetches recent news about Gros-Islet using Google Search grounding.
 */
servicesRouter.get('/news', async (req, res, next) => {
    if (!ai) return res.json([]);
    try {
        const prompt = `Find 2-3 recent, relevant news articles about Gros-Islet, St. Lucia from official sources. Format each as a JSON object with "title", "summary", "url", and "sourceTitle" keys. The URL MUST come from a real grounding source. Return a JSON array.`;
        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });
        
        const articles = parseGeminiJsonResponse(response.text) as NewsArticle[];
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => chunk.web) || [];
        
        // Enhance articles with grounding metadata as a fallback
        const enhancedArticles = articles.map((article, index) => ({
            ...article,
            url: article.url || sources[index]?.uri || '#',
            sourceTitle: article.sourceTitle || sources[index]?.title || 'Source',
        }));
        
        res.json(enhancedArticles);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/itinerary
 * AI-powered: Generates itinerary suggestions based on user preferences and grounded in local business data.
 */
servicesRouter.post('/itinerary', validateItineraryRequest, async (req, res, next) => {
    if (!ai) return res.json({ title: `Mock trip`, duration: 3, suggestions: [] });
    try {
        const { interests, budget, duration } = req.body;
        const businessContext = JSON.stringify(businesses.map(({ id, name, category, description, location }) => ({ id, name, category, description, location })));
        
        const prompt = `
You are an expert travel planner for Gros-Islet, St. Lucia, creating a ${duration}-day trip for a tourist interested in "${interests}" on a "${budget}" budget.
Use ONLY the businesses provided in the JSON context below to create suggestions.
Context: ${businessContext}
Instructions:
1. Select relevant businesses from the context.
2. Structure the response as a single JSON object adhering to the 'ItinerarySuggestions' TypeScript interface.
3. For each option, use the business ID from the context. Ensure each option's 'id' is a unique string (e.g., "businessId-day1-opt1").
4. DO NOT invent businesses.
5. Return ONLY the JSON object.`;

        const response = await ai.models.generateContent({
            model: GEMINI_FLASH_MODEL,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const itinerary = parseGeminiJsonResponse(response.text);
        logger.info(`Itinerary generated for interests: "${interests}", budget: ${budget}, duration: ${duration} days`);
        res.json(itinerary);
    } catch (error) {
        logger.error('Itinerary generation error:', error);
        next(error);
    }
});


// --- REGISTER ROUTERS ---
app.use('/api/auth', authRouter);
app.use('/api/businesses', businessRouter);
app.use('/api/events', eventRouter);
app.use('/api', servicesRouter); // For general content and AI services


// --- CENTRALIZED ERROR HANDLER ---
// This middleware catches all errors passed by `next(error)`.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error('Unhandled error:', err);
    
    // Don't leak error details in production
    const message = isDevelopment ? err.message : 'An internal server error occurred.';
    res.status(500).json({ message });
});

// --- SERVER INITIALIZATION ---
const startServer = async () => {
    try {
        // Initialize users with hashed passwords
        users = await initializeUsers();
        logger.info('Users initialized successfully');
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`✅ GIBD Backend is running on http://localhost:${PORT}`);
            logger.info(`Environment: ${config.NODE_ENV}`);
            logger.info(`Log level: ${config.LOG_LEVEL}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

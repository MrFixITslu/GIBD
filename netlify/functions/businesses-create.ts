import { Handler } from '@netlify/functions';
import * as jwt from 'jsonwebtoken';
import { neon } from '@netlify/neon';

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    // Check if database URL is configured
    if (!process.env.NETLIFY_DATABASE_URL) {
      console.error('NETLIFY_DATABASE_URL is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Database connection not configured. Please set NETLIFY_DATABASE_URL environment variable.',
          error: 'MISSING_DATABASE_URL'
        }),
      };
    }

    // Check if JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Authentication not configured. Please set JWT_SECRET environment variable.',
          error: 'MISSING_JWT_SECRET'
        }),
      };
    }

    // Initialize database connection using simplified syntax
    const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL

    // Verify JWT token
    const authHeader = event.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Authentication required' }),
      };
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid token' }),
      };
    }

    const businessData = JSON.parse(event.body || '{}');
    const { name, category, description, contact, location, coordinates, hours, images, tags, offers } = businessData;

    if (!name || !category) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Name and category are required' }),
      };
    }

    // Create business
    const [business] = await sql`
      INSERT INTO businesses (owner_id, name, category, description, contact, location, coordinates, hours, images, tags, offers)
      VALUES (${decoded.userId}, ${name}, ${category}, ${description || null}, ${contact || null}, ${location || null}, ${coordinates || null}, ${hours || null}, ${images || null}, ${tags || null}, ${offers || null})
      RETURNING *
    `;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(business),
    };
  } catch (error) {
    console.error('Create business error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    let errorCode = 'UNKNOWN_ERROR';
    
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please check your database configuration.';
        errorCode = 'DATABASE_CONNECTION_ERROR';
      } else if (error.message.includes('authentication')) {
        errorMessage = 'Database authentication failed. Please check your database credentials.';
        errorCode = 'DATABASE_AUTH_ERROR';
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        errorMessage = 'Database tables not found. Please run the database setup script.';
        errorCode = 'MISSING_TABLES';
      } else {
        errorMessage = `Business creation error: ${error.message}`;
        errorCode = 'BUSINESS_CREATION_ERROR';
      }
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: errorMessage,
        error: errorCode
      }),
    };
  }
};

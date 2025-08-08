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

  if (event.httpMethod !== 'DELETE') {
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

    const eventId = event.path.split('/').pop();

    // Delete event (only if user owns the business that created it)
    const result = await sql`
      DELETE FROM events 
      WHERE id = ${eventId} 
      AND business_id IN (
        SELECT id FROM businesses WHERE owner_id = ${decoded.userId}
      )
    `;

    if (!result || result.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Event not found or access denied' }),
      };
    }

    return {
      statusCode: 204,
      headers,
    };
  } catch (error) {
    console.error('Delete event error:', error);
    
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
        errorMessage = `Event deletion error: ${error.message}`;
        errorCode = 'EVENT_DELETION_ERROR';
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

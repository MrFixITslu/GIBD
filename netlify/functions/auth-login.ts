import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

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

    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    // Get user from database
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Invalid credentials' }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: { id: user.id, email: user.email },
        token,
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    
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
        errorMessage = `Authentication error: ${error.message}`;
        errorCode = 'AUTH_ERROR';
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

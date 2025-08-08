import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

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
          message: 'Database connection not configured. Please set NETLIFY_DATABASE_URL environment variable.' 
        }),
      };
    }

    const { email, password } = JSON.parse(event.body || '{}');

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: 'Email and password are required' }),
      };
    }

    // Check if user already exists
    const [existingUser] = await sql`SELECT id FROM users WHERE email = ${email}`;

    if (existingUser) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({ message: 'User already exists' }),
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Create user
    await sql`
      INSERT INTO users (id, email, password_hash)
      VALUES (${userId}, ${email}, ${passwordHash})
    `;

    // Check if JWT secret is configured
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          message: 'Authentication not configured. Please set JWT_SECRET environment variable.' 
        }),
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        user: { id: userId, email },
        token,
      }),
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

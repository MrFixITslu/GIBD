import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';

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

  if (event.httpMethod !== 'GET') {
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

    const events = await sql`
      SELECT 
        id,
        title,
        date,
        time,
        description,
        business_id as "businessId",
        image
      FROM events
      ORDER BY date ASC, time ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(events),
    };
  } catch (error) {
    console.error('Get events error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message.includes('connection')) {
        errorMessage = 'Database connection failed. Please check your database configuration.';
      } else if (error.message.includes('authentication')) {
        errorMessage = 'Database authentication failed. Please check your database credentials.';
      } else {
        errorMessage = `Database error: ${error.message}`;
      }
    }
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: errorMessage }),
    };
  }
};

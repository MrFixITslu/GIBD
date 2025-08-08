import { Handler } from '@netlify/functions';
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

    // Initialize database connection using simplified syntax
    const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL

    // Extract business ID from path
    const businessId = event.path.split('/')[event.path.split('/').length - 2]; // Get businessId from path like /businesses/:id/vote

    // Check if business exists
    const [business] = await sql`
      SELECT id, votes FROM businesses WHERE id = ${businessId}
    `;

    if (!business) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Business not found' }),
      };
    }

    // Increment vote count
    const [updatedBusiness] = await sql`
      UPDATE businesses 
      SET votes = votes + 1 
      WHERE id = ${businessId}
      RETURNING id, votes
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedBusiness),
    };
  } catch (error) {
    console.error('Vote for business error:', error);
    
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
        errorMessage = `Vote error: ${error.message}`;
        errorCode = 'VOTE_ERROR';
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

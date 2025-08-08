import { Handler } from '@netlify/functions';

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
    // Check environment variables
    const envVars = {
      NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? 'Configured' : 'Missing',
      JWT_SECRET: process.env.JWT_SECRET ? 'Configured' : 'Missing',
      API_KEY: process.env.API_KEY ? 'Configured' : 'Missing',
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Debug endpoint working',
        timestamp: new Date().toISOString(),
        environment: envVars,
        function: 'debug',
      }),
    };
  } catch (error) {
    console.error('Debug error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        message: 'Debug function error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};

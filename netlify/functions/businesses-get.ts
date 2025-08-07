import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    const businesses = await sql`
      SELECT 
        id,
        owner_id as "ownerId",
        name,
        category,
        description,
        contact,
        location,
        coordinates,
        hours,
        images,
        rating,
        tags,
        offers,
        votes
      FROM businesses
      ORDER BY votes DESC, name ASC
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(businesses),
    };
  } catch (error) {
    console.error('Get businesses error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

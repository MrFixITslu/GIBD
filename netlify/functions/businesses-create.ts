import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    // Verify authorization
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: 'Authorization required' }),
      };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };

    const businessData = JSON.parse(event.body || '{}');
    const businessId = uuidv4();

    // Insert business into database
    await sql`
      INSERT INTO businesses (
        id, owner_id, name, category, description, contact, location, 
        coordinates, hours, images, rating, tags, offers, votes
      ) VALUES (
        ${businessId}, ${decoded.userId}, ${businessData.name}, ${businessData.category},
        ${businessData.description}, ${JSON.stringify(businessData.contact)}, ${businessData.location},
        ${JSON.stringify(businessData.coordinates)}, ${JSON.stringify(businessData.hours)},
        ${JSON.stringify(businessData.images)}, 0, ${JSON.stringify(businessData.tags)},
        ${businessData.offers || null}, 0
      )
    `;

    // Return the created business
    const [business] = await sql`
      SELECT 
        id, owner_id as "ownerId", name, category, description, contact, location,
        coordinates, hours, images, rating, tags, offers, votes
      FROM businesses WHERE id = ${businessId}
    `;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(business),
    };
  } catch (error) {
    console.error('Create business error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

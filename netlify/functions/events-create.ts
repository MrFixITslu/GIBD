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

    const eventData = JSON.parse(event.body || '{}');
    const eventId = uuidv4();

    // Generate a placeholder image URL
    const imageUrl = `https://picsum.photos/400/300?random=${eventId}`;

    // Insert event into database
    await sql`
      INSERT INTO events (
        id, title, date, time, description, business_id, image
      ) VALUES (
        ${eventId}, ${eventData.title}, ${eventData.date}, ${eventData.time},
        ${eventData.description}, ${eventData.businessId}, ${imageUrl}
      )
    `;

    // Return the created event
    const [newEvent] = await sql`
      SELECT 
        id, title, date, time, description, business_id as "businessId", image
      FROM events WHERE id = ${eventId}
    `;

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(newEvent),
    };
  } catch (error) {
    console.error('Create event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

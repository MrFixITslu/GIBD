import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // Extract event ID from path
    const eventId = event.path.split('/').pop();

    // Check if event exists and user owns the associated business
    const [eventCheck] = await sql`
      SELECT e.id, b.owner_id 
      FROM events e
      JOIN businesses b ON e.business_id = b.id
      WHERE e.id = ${eventId}
    `;

    if (!eventCheck) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Event not found' }),
      };
    }

    if (eventCheck.owner_id !== decoded.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Not authorized to delete this event' }),
      };
    }

    // Delete event
    await sql`DELETE FROM events WHERE id = ${eventId}`;

    return {
      statusCode: 204,
      headers,
    };
  } catch (error) {
    console.error('Delete event error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

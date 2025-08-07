import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';
import jwt from 'jsonwebtoken';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'PUT, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
    };
  }

  if (event.httpMethod !== 'PUT') {
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

    // Extract business ID from path
    const businessId = event.path.split('/').pop();
    const updateData = JSON.parse(event.body || '{}');

    // Check if business exists and user owns it
    const [business] = await sql`
      SELECT owner_id FROM businesses WHERE id = ${businessId}
    `;

    if (!business) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: 'Business not found' }),
      };
    }

    if (business.owner_id !== decoded.userId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Not authorized to update this business' }),
      };
    }

    // Update business
    await sql`
      UPDATE businesses 
      SET name = ${updateData.name}, description = ${updateData.description}
      WHERE id = ${businessId}
    `;

    // Return updated business
    const [updatedBusiness] = await sql`
      SELECT 
        id, owner_id as "ownerId", name, category, description, contact, location,
        coordinates, hours, images, rating, tags, offers, votes
      FROM businesses WHERE id = ${businessId}
    `;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(updatedBusiness),
    };
  } catch (error) {
    console.error('Update business error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

import { Handler } from '@netlify/functions';
import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL!);

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

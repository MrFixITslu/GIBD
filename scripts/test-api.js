#!/usr/bin/env node

// Test script to verify API endpoints are working
// Usage: node scripts/test-api.js [base-url]

const baseUrl = process.argv[2] || 'https://v79sl.online';

console.log('🧪 Testing API endpoints...\n');

async function testEndpoint(endpoint, description) {
  try {
    const response = await fetch(`${baseUrl}${endpoint}`);
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log(`✅ ${description}:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Data type: ${Array.isArray(data) ? 'Array' : 'Object'}`);
      console.log(`   Items: ${Array.isArray(data) ? data.length : 'N/A'}`);
    } else {
      console.log(`❌ ${description}:`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Error: Expected JSON but got ${contentType}`);
    }
  } catch (error) {
    console.log(`❌ ${description}:`);
    console.log(`   Error: ${error.message}`);
  }
  console.log('');
}

async function runTests() {
  console.log(`Testing endpoints at: ${baseUrl}\n`);
  
  await testEndpoint('/api/debug', 'Debug Endpoint');
  await testEndpoint('/api/businesses', 'Businesses API');
  await testEndpoint('/api/events', 'Events API');
  
  console.log('🎯 Test Summary:');
  console.log('- If you see ✅ for all endpoints, your setup is working!');
  console.log('- If you see ❌, check your environment variables and database setup.');
  console.log('- See SETUP_GUIDE.md for detailed instructions.');
}

runTests().catch(console.error);

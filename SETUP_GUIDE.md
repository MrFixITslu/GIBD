# 🚀 Netlify Setup Guide - Fix Your Errors

## **Current Issues Fixed:**

### ✅ **Error 1: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**
- **Cause**: Missing environment variables causing Netlify functions to fail
- **Fix**: Enhanced error handling and environment variable checks

### ✅ **Error 2: "Cannot read properties of null (reading 'type')"**
- **Cause**: Binance wallet browser extension (unrelated to your app)
- **Fix**: Can be safely ignored or disable crypto extensions

---

## **Step 1: Set Up Environment Variables in Netlify**

### **Required Variables:**

1. **Go to Netlify Dashboard** → Your Site → Site Settings → Environment Variables
2. **Add these variables:**

```bash
# Database Connection (REQUIRED)
NETLIFY_DATABASE_URL=postgresql://username:password@your-neon-host/your-database-name

# Authentication (REQUIRED)
JWT_SECRET=your-super-secure-jwt-secret-key-32-characters-minimum

# Optional API Keys
API_KEY=your-gemini-api-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### **How to Get Database URL:**
1. **Sign up for Neon** (https://neon.tech) - Free PostgreSQL database
2. **Create a new project**
3. **Copy the connection string** from your dashboard
4. **Format**: `postgresql://username:password@host/database`

### **Generate JWT Secret:**
```bash
# Run this in your terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## **Step 2: Create Database Tables**

### **Run this SQL in your Neon database:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Businesses table
CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    contact JSONB,
    location VARCHAR(255),
    coordinates JSONB,
    hours JSONB,
    images TEXT[],
    rating DECIMAL(3,2) DEFAULT 0,
    votes INTEGER DEFAULT 0,
    tags TEXT[],
    offers JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES businesses(id),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time TIME,
    description TEXT,
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO businesses (name, category, description, location, tags) VALUES
('Gros-Islet Beach Bar', 'Restaurant', 'Local beach bar with fresh seafood', 'Gros-Islet Beach', ARRAY['beach', 'seafood', 'local']),
('Caribbean Crafts', 'Retail', 'Handmade local crafts and souvenirs', 'Main Street', ARRAY['crafts', 'souvenirs', 'local']),
('Island Tours', 'Tourism', 'Guided tours of Gros-Islet and surrounding areas', 'Tourist Center', ARRAY['tours', 'guided', 'local']);

INSERT INTO events (title, date, time, description, business_id) VALUES
('Live Music Night', '2024-02-15', '19:00', 'Local musicians performing Caribbean music', (SELECT id FROM businesses WHERE name = 'Gros-Islet Beach Bar' LIMIT 1)),
('Craft Fair', '2024-02-20', '10:00', 'Local artisans showcasing their work', (SELECT id FROM businesses WHERE name = 'Caribbean Crafts' LIMIT 1));
```

---

## **Step 3: Test Your Setup**

### **1. Test Debug Endpoint:**
Visit: `https://your-site.netlify.app/api/debug`
**Expected Response:**
```json
{
  "message": "Debug endpoint working",
  "timestamp": "2024-01-XX...",
  "environment": {
    "NETLIFY_DATABASE_URL": "Configured",
    "JWT_SECRET": "Configured",
    "API_KEY": "Missing"
  }
}
```

### **2. Test API Endpoints:**
- **Businesses**: `https://your-site.netlify.app/api/businesses`
- **Events**: `https://your-site.netlify.app/api/events`

**Expected Response:** JSON array of data (not HTML!)

---

## **Step 4: Deploy Your Changes**

### **Option A: Deploy via Git (Recommended)**
```bash
git add .
git commit -m "Fix: Enhanced error handling and environment variable checks"
git push origin main
```

### **Option B: Deploy via Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

---

## **Step 5: Verify Everything Works**

### **✅ Success Indicators:**
1. **No more "Unexpected token '<'" errors**
2. **API calls return JSON (not HTML)**
3. **Application loads with proper error handling**
4. **Debug endpoint shows "Configured" for required variables**

### **❌ If Still Having Issues:**

#### **Check Environment Variables:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Verify all required variables are set
3. Check for typos in variable names

#### **Check Database Connection:**
1. Test your database URL in a PostgreSQL client
2. Verify tables exist: `\dt` in psql
3. Check if you can connect from external sources

#### **Check Netlify Function Logs:**
1. Go to Netlify Dashboard → Functions
2. Check for any function errors
3. Look for environment variable issues

---

## **Troubleshooting Common Issues:**

### **Issue: "Database connection not configured"**
**Solution:** Set `NETLIFY_DATABASE_URL` in Netlify environment variables

### **Issue: "Database connection failed"**
**Solution:** Check your database URL format and credentials

### **Issue: "Database tables not found"**
**Solution:** Run the SQL script above in your database

### **Issue: "JWT_SECRET not configured"**
**Solution:** Set `JWT_SECRET` in Netlify environment variables

### **Issue: Still getting HTML responses**
**Solution:** Check Netlify function logs for specific errors

---

## **Next Steps After Setup:**

1. **Add your real business data** to the database
2. **Configure authentication** for business owners
3. **Set up image uploads** for business logos
4. **Add more features** like reviews and ratings

---

## **Support:**

If you're still having issues:
1. Check the debug endpoint: `/api/debug`
2. Look at browser console for specific error messages
3. Check Netlify function logs in the dashboard
4. Verify all environment variables are set correctly
5. **Reference the [Netlify documentation](https://docs.netlify.com/?attr=support) for more details**

**Your app should now work without the "Unexpected token '<'" errors!** 🎉

---

## **Technical Notes:**

### **Database Connection:**
Our Netlify functions now use the simplified `neon()` syntax as recommended in the [Netlify documentation](https://docs.netlify.com/?attr=support):

```typescript
import { neon } from '@netlify/neon';
const sql = neon(); // automatically uses env NETLIFY_DATABASE_URL
const [post] = await sql`SELECT * FROM posts WHERE id = ${postId}`;
```

This approach automatically uses the `NETLIFY_DATABASE_URL` environment variable and follows Netlify's best practices for database connectivity.

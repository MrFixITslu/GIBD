# Next Steps - Complete Your Deployment

## ✅ Step 1: Changes Deployed
Your fixes have been deployed to Netlify. The build should now succeed without the package-lock.json issues.

## 🔧 Step 2: Set Up Environment Variables (CRITICAL)

### Go to Netlify Dashboard:
1. Visit [Netlify Dashboard](https://app.netlify.com)
2. Find your site (v79sl.online)
3. Go to **Site Settings** → **Environment Variables**

### Add Required Variables:

#### 2.1 Database Connection
**Variable Name:** `NETLIFY_DATABASE_URL`  
**Value:** `postgresql://username:password@your-neon-host/your-database-name`

**How to get this:**
1. Go to [Neon](https://neon.tech) and create a free PostgreSQL database
2. Copy the connection string from your Neon dashboard
3. It should look like: `postgresql://username:password@ep-something.region.aws.neon.tech/database-name`

#### 2.2 JWT Secret
**Variable Name:** `JWT_SECRET`  
**Value:** Generate a secure 32+ character secret

**How to generate:**
```bash
# Run this in your terminal to generate a secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Optional Variables (for AI features):
- `API_KEY` - Google Gemini API key
- `GOOGLE_MAPS_API_KEY` - Google Maps API key

## 🗄️ Step 3: Create Database Tables

### 3.1 Connect to Your Neon Database
1. Go to your Neon dashboard
2. Click on your database
3. Go to the **SQL Editor** tab

### 3.2 Run This SQL:
```sql
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

-- Create indexes for better performance
CREATE INDEX idx_businesses_owner_id ON businesses(owner_id);
CREATE INDEX idx_businesses_category ON businesses(category);
CREATE INDEX idx_events_business_id ON events(business_id);
CREATE INDEX idx_events_date ON events(date);
```

## 🧪 Step 4: Test Your Application

### 4.1 Test the Debug Endpoint
1. Visit: `https://v79sl.online/api/debug`
2. You should see JSON like this:
```json
{
  "message": "Debug endpoint working",
  "timestamp": "2025-08-08T...",
  "environment": {
    "NETLIFY_DATABASE_URL": "Configured",
    "JWT_SECRET": "Configured",
    "API_KEY": "Missing"
  },
  "function": "debug"
}
```

### 4.2 Test the Main API Endpoints
1. Visit: `https://v79sl.online/api/businesses`
2. Visit: `https://v79sl.online/api/events`
3. Both should return JSON arrays (even if empty)

### 4.3 Test the Frontend
1. Visit: `https://v79sl.online`
2. Open DevTools → Network tab
3. Check that API calls return JSON (not HTML)
4. The error message should be more specific now

## 🔍 Step 5: Troubleshooting

### If you still see "Unexpected token '<'" error:
1. **Check Environment Variables**: Make sure `NETLIFY_DATABASE_URL` and `JWT_SECRET` are set
2. **Wait for Deployment**: Netlify takes a few minutes to deploy changes
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5) or try incognito mode

### If `/api/debug` returns HTML:
1. **Environment Variables Missing**: Set them in Netlify dashboard
2. **Function Not Deployed**: Wait for deployment to complete
3. **Check Netlify Logs**: Go to Functions tab in Netlify dashboard

### If database connection fails:
1. **Check Connection String**: Verify the Neon connection string is correct
2. **Database Tables**: Make sure you ran the SQL to create tables
3. **Network Issues**: Check if Neon is accessible

## 🎯 Expected Results

After completing these steps, you should see:

### ✅ Working Features:
- Application loads without "Unexpected token" errors
- Clear error messages if database is not configured
- API endpoints return proper JSON responses
- Debug endpoint shows environment variable status
- Authentication system works (login/register)

### ✅ Error Messages (if something is wrong):
- "Database not configured. Please set up the database connection in your Netlify environment variables."
- "Database connection failed. Please check your database configuration and credentials."
- "Authentication not configured. Please set JWT_SECRET environment variable."

## 🚀 Step 6: Add Sample Data (Optional)

Once everything is working, you can add sample data:

### Add a Test User:
```sql
INSERT INTO users (email, password_hash) 
VALUES ('test@example.com', '$2a$12$...hashed_password...');
```

### Add Sample Businesses:
```sql
INSERT INTO businesses (name, category, description, contact, location) 
VALUES 
('Sample Restaurant', 'Food & Dining', 'A great place to eat', '{"phone": "123-456-7890"}', 'Gros-Islet, St. Lucia');
```

## 📞 Need Help?

If you encounter issues:
1. Check the `/api/debug` endpoint first
2. Look at Netlify function logs in the dashboard
3. Verify environment variables are set correctly
4. Ensure database tables are created

The fixes I've applied will provide much clearer error messages to help you diagnose any remaining issues!

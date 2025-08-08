# 🔧 **NETLIFY ENVIRONMENT VARIABLES SETUP**

## 🚨 **CRITICAL - Your API is failing because environment variables are missing!**

The error "Invalid JSON response from server" means your Netlify Functions are returning **HTML error pages** instead of JSON, likely due to missing environment variables.

---

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

Go to **Netlify Dashboard** → **Your Site** → **Site Settings** → **Environment Variables** and add these:

### **🔒 ESSENTIAL (Required for Functions to Work)**

```bash
# Database Connection (CRITICAL)
DATABASE_URL=your_neon_database_url_here
NETLIFY_DATABASE_URL=your_neon_database_url_here

# JWT Authentication (CRITICAL)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS Security (CRITICAL)
CORS_ORIGIN=https://your-site-name.netlify.app

# Node Environment
NODE_ENV=production
```

### **🛡️ SECURITY & PERFORMANCE (Recommended)**

```bash
# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info

# API Security
API_KEY=your-optional-api-key
```

### **🗺️ OPTIONAL (For Full Functionality)**

```bash
# Google Maps (for location features)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# If using custom port (usually not needed on Netlify)
PORT=8888
```

---

## 🚨 **IMMEDIATE FIXES NEEDED**

### **1. Check Your Database URL**

Your `DATABASE_URL` must be a **valid Neon/PostgreSQL connection string**:

```bash
# Format should be:
DATABASE_URL=postgresql://username:password@hostname:5432/database_name?sslmode=require

# Example (Neon):
DATABASE_URL=postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### **2. Generate a Strong JWT Secret**

```bash
# Use a random 32+ character string:
JWT_SECRET=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx
```

### **3. Set Correct CORS Origin**

```bash
# Use your actual Netlify domain:
CORS_ORIGIN=https://your-actual-site-name.netlify.app
```

---

## 🧪 **TEST YOUR SETUP**

After adding environment variables:

### **Step 1: Redeploy**
1. Go to **Deploys** → **Trigger Deploy**
2. Wait for deployment to complete

### **Step 2: Test Health Check**
Visit: `https://your-site.netlify.app/api/health-check`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T19:10:17.316Z",
  "environment": "production",
  "database": "connected"
}
```

**If you get HTML instead** → Environment variables are still missing!

### **Step 3: Test API Endpoints**
- `https://your-site.netlify.app/api/businesses` (should return `[]` or business data)
- `https://your-site.netlify.app/api/events` (should return `[]` or event data)

---

## 🔧 **DEBUGGING STEPS**

### **If Still Getting "Invalid JSON Response":**

1. **Check Netlify Function Logs:**
   - Dashboard → Functions → Click function name → View logs

2. **Common Issues:**
   - ❌ `DATABASE_URL` not set → Functions crash
   - ❌ `JWT_SECRET` too short → Auth fails
   - ❌ `CORS_ORIGIN` wrong → Browser blocks requests
   - ❌ Database not accessible → Connection fails

3. **Quick Test:**
   ```bash
   # In browser console on your site:
   fetch('/api/health-check')
     .then(r => r.text())
     .then(console.log)
   ```

---

## 🎯 **ENVIRONMENT VARIABLES CHECKLIST**

Copy this to your Netlify environment variables:

- [ ] `DATABASE_URL` → Your Neon connection string
- [ ] `NETLIFY_DATABASE_URL` → Same as DATABASE_URL
- [ ] `JWT_SECRET` → Random 32+ character string
- [ ] `JWT_EXPIRES_IN` → `7d`
- [ ] `CORS_ORIGIN` → `https://your-site.netlify.app`
- [ ] `NODE_ENV` → `production`
- [ ] `LOG_LEVEL` → `info`

**After setting these, REDEPLOY and test `/api/health-check`**

---

## 🚀 **SUCCESS INDICATORS**

When properly configured:

✅ **No more "Invalid JSON response" errors**  
✅ **Health check returns JSON**  
✅ **Businesses and events load**  
✅ **No wallet `inpage.js` errors**  

Your app will then work perfectly! 🎉

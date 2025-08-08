@echo off
REM Comprehensive Deployment and Testing Script for Gros-Islet Business Directory
REM This script builds, deploys, and tests your application

echo 🚀 Starting comprehensive deployment and testing...

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Netlify CLI...
    npm install -g netlify-cli
)

REM Clean and install dependencies
echo 🔧 Cleaning and installing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install --legacy-peer-deps

REM TypeScript compilation check
echo 🔍 Checking TypeScript compilation...
npx tsc --noEmit
if %errorlevel% neq 0 (
    echo ❌ TypeScript compilation failed! Please fix the errors above.
    exit /b 1
)
echo ✅ TypeScript compilation successful!

REM Build the application
echo 🔨 Building application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please check the errors above.
    exit /b 1
)
echo ✅ Build successful!

REM Deploy to Netlify
echo 🌐 Deploying to Netlify...
netlify deploy --prod --dir=dist
if %errorlevel% neq 0 (
    echo ❌ Deployment failed! Please check the errors above.
    exit /b 1
)
echo ✅ Deployment successful!

REM Wait a moment for deployment to complete
echo ⏳ Waiting for deployment to complete...
timeout /t 10 /nobreak >nul

REM Test the API endpoints
echo 🧪 Testing API endpoints...
node scripts/test-api.js

echo.
echo 🎉 Deployment and testing complete!
echo.
echo 📋 Next steps:
echo 1. Set up environment variables in Netlify dashboard:
echo    - NETLIFY_DATABASE_URL
echo    - JWT_SECRET
echo 2. Run the database setup script in your Neon database
echo 3. Test your application at the deployed URL
echo.
echo 📖 For detailed setup instructions, see SETUP_GUIDE.md
echo 🔧 For troubleshooting, see FIXES_SUMMARY.md

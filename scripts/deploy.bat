@echo off
REM Deployment Script for Gros-Islet Business Directory
REM This script helps deploy your application to Netlify

echo 🚀 Deploying Gros-Islet Business Directory to Netlify...

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Netlify CLI...
    npm install -g netlify-cli
)

REM Build the application
echo 🔨 Building application...
npm run build

REM Check if build was successful
if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed! Please check the errors above.
    exit /b 1
)

REM Deploy to Netlify
echo 🌐 Deploying to Netlify...
netlify deploy --prod --dir=dist

echo 🎉 Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Set up environment variables in Netlify dashboard:
echo    - NETLIFY_DATABASE_URL
echo    - JWT_SECRET
echo 2. Run the database setup script in your Neon database
echo 3. Test your application at the deployed URL
echo.
echo 📖 For detailed setup instructions, see SETUP_GUIDE.md

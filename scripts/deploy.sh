#!/bin/bash

# Deployment Script for Gros-Islet Business Directory
# This script helps deploy your application to Netlify

echo "🚀 Deploying Gros-Islet Business Directory to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set up environment variables in Netlify dashboard:"
echo "   - NETLIFY_DATABASE_URL"
echo "   - JWT_SECRET"
echo "2. Run the database setup script in your Neon database"
echo "3. Test your application at the deployed URL"
echo ""
echo "📖 For detailed setup instructions, see SETUP_GUIDE.md"

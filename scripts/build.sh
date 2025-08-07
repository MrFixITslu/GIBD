#!/bin/bash

# Production build script for GIBD
set -e

echo "🏗️  Building GIBD for production..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please copy env.example to .env and configure it."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Type checking
echo "🔍 Running type check..."
npm run type-check

# Linting
echo "🧹 Running linter..."
npm run lint

# Testing
echo "🧪 Running tests..."
npm run test:coverage

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Build backend (if needed)
echo "🔧 Preparing backend..."
npx tsc server.ts --outDir dist --target ES2020 --module ESNext --moduleResolution node

echo "✅ Build completed successfully!"
echo "📁 Frontend build: dist/"
echo "📁 Backend build: dist/server.js"
echo ""
echo "🚀 To start production server:"
echo "   npm start"

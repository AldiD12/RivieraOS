#!/bin/bash
# Riviera OS - Frontend Deployment Script for Render.com

echo "🚀 Riviera OS Frontend Deployment"
echo "=================================="

cd frontend

# Install dependencies
echo "📦 Installing npm packages..."
npm ci

# Build the application
echo "🔨 Building production bundle..."
npm run build

echo "✅ Build complete! Static files are in frontend/dist/"

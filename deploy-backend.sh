#!/bin/bash
# Riviera OS - Backend Deployment Script for Render.com

echo "🚀 Riviera OS Backend Deployment"
echo "================================"

# Install dependencies
echo "📦 Restoring .NET packages..."
dotnet restore backend/RestaurantQRApi.csproj

# Build the application
echo "🔨 Building application..."
dotnet build backend/RestaurantQRApi.csproj --configuration Release --no-restore

# Run database migrations (if connection string is provided)
if [ ! -z "$ConnectionStrings__DefaultConnection" ]; then
    echo "🗄️  Running database migrations..."
    cd backend
    dotnet ef database update --no-build
    cd ..
else
    echo "⚠️  No connection string found - skipping migrations"
fi

# Start the application
echo "✅ Starting Riviera OS API..."
cd backend
dotnet run --configuration Release --no-build

#!/bin/bash
set -e

echo "🚀 Starting Vercel deployment..."

# Install root dependencies (workspace setup)
echo "📦 Installing dependencies..."
npm install --frozen-lockfile

# Build frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

echo "✅ Build complete!"

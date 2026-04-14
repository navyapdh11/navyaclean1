#!/bin/bash
set -e

echo "🚀 Starting Vercel deployment..."

# Install root workspace dependencies (this includes all workspaces)
echo "📦 Installing workspace dependencies..."
npm install --workspace=@cleaning-services/frontend --include=dev

# Also install root dev dependencies for tailwindcss
echo "📦 Installing root dev dependencies..."
npm install

# Build frontend from root using workspace script
echo "🔨 Building frontend..."
npm run build:frontend

echo "✅ Build complete!"

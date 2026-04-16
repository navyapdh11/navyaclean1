#!/bin/bash
# Render Deployment Script
# Deploys CleanPro Enterprise to Render

API_KEY="${RENDER_API_KEY:?Error: RENDER_API_KEY required}"
OWNER_ID="${RENDER_OWNER_ID:?Error: RENDER_OWNER_ID required}"
REPO="https://github.com/navyapdh11/cleaning-services-enterprise-2026"
BRANCH="main"

echo "=== Deploying CleanPro Enterprise to Render ==="

# Backend
echo "Creating backend service..."
BACKEND=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"web_service\",\"name\":\"cleanpro-backend\",\"ownerId\":\"$OWNER_ID\",\"repo\":\"$REPO\",\"autoDeploy\":\"yes\",\"branch\":\"$BRANCH\",\"rootDir\":\"backend\",\"serviceDetails\":{\"env\":\"node\",\"plan\":\"free\",\"region\":\"oregon\",\"healthCheckPath\":\"/health\",\"envSpecificDetails\":{\"buildCommand\":\"npm install && npx prisma generate && npx tsc\",\"startCommand\":\"node dist/server.js\"}},\"envVars\":[{\"key\":\"NODE_ENV\",\"value\":\"production\"},{\"key\":\"JWT_SECRET\",\"generateValue\":true},{\"key\":\"JWT_REFRESH_SECRET\",\"generateValue\":true},{\"key\":\"JWT_EXPIRES_IN\",\"value\":\"15m\"},{\"key\":\"JWT_REFRESH_EXPIRES_IN\",\"value\":\"30d\"},{\"key\":\"LOG_LEVEL\",\"value\":\"info\"}]}")

BACKEND_URL=$(echo "$BACKEND" | jq -r '.service.serviceDetails.url')
echo "✅ Backend: $BACKEND_URL"

# Frontend
echo "Creating frontend service..."
FRONTEND=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"web_service\",\"name\":\"cleanpro-frontend\",\"ownerId\":\"$OWNER_ID\",\"repo\":\"$REPO\",\"autoDeploy\":\"yes\",\"branch\":\"$BRANCH\",\"rootDir\":\"frontend\",\"serviceDetails\":{\"env\":\"node\",\"plan\":\"free\",\"region\":\"oregon\",\"envSpecificDetails\":{\"buildCommand\":\"npm install && npm run build\",\"startCommand\":\"npm start\"}},\"envVars\":[{\"key\":\"NODE_ENV\",\"value\":\"production\"}]}")

FRONTEND_URL=$(echo "$FRONTEND" | jq -r '.service.serviceDetails.url')
echo "✅ Frontend: $FRONTEND_URL"

echo ""
echo "=== Deployment Summary ==="
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"

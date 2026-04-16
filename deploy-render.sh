#!/bin/bash
# Render Deployment Script
# This script deploys the CleanPro Enterprise platform to Render

# Required environment variables:
# - RENDER_API_KEY: Your Render API key
# - RENDER_OWNER_ID: Your Render owner/team ID

API_KEY="${RENDER_API_KEY:?Error: RENDER_API_KEY environment variable is required}"
OWNER_ID="${RENDER_OWNER_ID:?Error: RENDER_OWNER_ID environment variable is required}"
REPO="https://github.com/navyapdh11/cleaning-services-enterprise-2026"
BRANCH="main"

echo "=== Deploying CleanPro Enterprise to Render ==="
echo ""

# Step 1: Create PostgreSQL database
echo "Step 1: Creating PostgreSQL database..."
DB_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/databases" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"cleanpro-db\",
    \"ownerId\": \"$OWNER_ID\",
    \"region\": \"oregon\",
    \"plan\": \"starter\",
    \"version\": \"14\"
  }")

echo "Database response: $DB_RESPONSE"
echo ""

# Extract database ID
DB_ID=$(echo "$DB_RESPONSE" | jq -r '.id // empty')

if [ -z "$DB_ID" ]; then
  echo "⚠️  Database creation may have failed or already exists. Continuing..."
  echo "Response: $DB_RESPONSE"
else
  echo "✅ Database created: $DB_ID"
fi

echo ""
echo "Step 2: Create backend service..."
BACKEND_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"cleanpro-backend\",
    \"ownerId\": \"$OWNER_ID\",
    \"repo\": {
      \"repo\": \"$REPO\",
      \"branch\": \"$BRANCH\",
      \"rootDir\": \"backend\"
    },
    \"autoDeploy\": \"yes\",
    \"serviceDetails\": {
      \"env\": \"node\",
      \"buildCommand\": \"npm install && npx prisma generate && npx tsc\",
      \"startCommand\": \"node dist/server.js\",
      \"healthCheckPath\": \"/health\",
      \"plan\": \"free\",
      \"region\": \"oregon\"
    },
    \"envVars\": [
      {\"key\": \"NODE_ENV\", \"value\": \"production\"},
      {\"key\": \"JWT_SECRET\", \"generateValue\": true},
      {\"key\": \"JWT_REFRESH_SECRET\", \"generateValue\": true},
      {\"key\": \"JWT_EXPIRES_IN\", \"value\": \"7d\"},
      {\"key\": \"JWT_REFRESH_EXPIRES_IN\", \"value\": \"30d\"},
      {\"key\": \"LOG_LEVEL\", \"value\": \"info\"}
    ]
  }")

echo "Backend response: $BACKEND_RESPONSE"
BACKEND_ID=$(echo "$BACKEND_RESPONSE" | jq -r '.id // empty')
BACKEND_URL=$(echo "$BACKEND_RESPONSE" | jq -r '.serviceDetails.url // empty')

echo ""
echo "Step 3: Create frontend service..."
FRONTEND_RESPONSE=$(curl -s -X POST "https://api.render.com/v1/services" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"web_service\",
    \"name\": \"cleanpro-frontend\",
    \"ownerId\": \"$OWNER_ID\",
    \"repo\": {
      \"repo\": \"$REPO\",
      \"branch\": \"$BRANCH\",
      \"rootDir\": \"frontend\"
    },
    \"autoDeploy\": \"yes\",
    \"serviceDetails\": {
      \"env\": \"node\",
      \"buildCommand\": \"npm install && npm run build\",
      \"startCommand\": \"npm start\",
      \"plan\": \"free\",
      \"region\": \"oregon\"
    },
    \"envVars\": [
      {\"key\": \"NODE_ENV\", \"value\": \"production\"}
    ]
  }")

echo "Frontend response: $FRONTEND_RESPONSE"
FRONTEND_ID=$(echo "$FRONTEND_RESPONSE" | jq -r '.id // empty')
FRONTEND_URL=$(echo "$FRONTEND_RESPONSE" | jq -r '.serviceDetails.url // empty')

echo ""
echo "=== Deployment Summary ==="
echo "Backend Service ID: $BACKEND_ID"
echo "Backend URL: $BACKEND_URL"
echo "Frontend Service ID: $FRONTEND_ID"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "✅ Deployment initiated! Services are building on Render."
echo "Check dashboard: https://dashboard.render.com"

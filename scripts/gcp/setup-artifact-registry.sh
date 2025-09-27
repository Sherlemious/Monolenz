#!/bin/bash

# Setup Artifact Registry repositories for Monolenz deployment
# Run this script to create the necessary Artifact Registry repositories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Setting up Artifact Registry for Monolenz${NC}"

# Get project configuration
read -p "Enter your Google Cloud Project ID: " PROJECT_ID
read -p "Enter your preferred region [us-central1]: " REGION
REGION=${REGION:-us-central1}

# Set the project
gcloud config set project $PROJECT_ID

# Enable Artifact Registry API
echo -e "${BLUE}🔌 Enabling Artifact Registry API${NC}"
gcloud services enable artifactregistry.googleapis.com

# Create repository for Docker images
echo -e "${BLUE}📦 Creating Docker repository${NC}"
gcloud artifacts repositories create monolenz \
    --repository-format=docker \
    --location=$REGION \
    --description="Monolenz application Docker images" || echo "Repository may already exist"

# Configure Docker authentication
echo -e "${BLUE}🔐 Configuring Docker authentication${NC}"
gcloud auth configure-docker $REGION-docker.pkg.dev

echo -e "${GREEN}✅ Artifact Registry setup completed!${NC}"
echo ""
echo "Repository URL: $REGION-docker.pkg.dev/$PROJECT_ID/monolenz"
echo ""
echo "Update your GitHub workflow environment variables:"
echo "REGISTRY: $REGION-docker.pkg.dev"
echo "REPOSITORY: monolenz"
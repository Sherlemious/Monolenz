#!/bin/bash

# Setup script for Google Cloud Run deployment with GitHub Actions
# Run this script to set up the necessary Google Cloud resources and GitHub secrets

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_REGION="us-central1"
DEFAULT_SERVICE_ACCOUNT_NAME="github-actions-deploy"

echo -e "${BLUE}🚀 Monolenz Deployment Setup${NC}"
echo "This script will help you set up Google Cloud resources and GitHub secrets for deployment."
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) is not installed. You'll need to set GitHub secrets manually.${NC}"
    echo "Install it from: https://cli.github.com/"
    GH_AVAILABLE=false
else
    GH_AVAILABLE=true
fi

# Get project configuration
echo -e "${BLUE}📋 Project Configuration${NC}"
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

read -p "Enter your preferred region [$DEFAULT_REGION]: " REGION
REGION=${REGION:-$DEFAULT_REGION}

read -p "Enter service account name [$DEFAULT_SERVICE_ACCOUNT_NAME]: " SERVICE_ACCOUNT_NAME
SERVICE_ACCOUNT_NAME=${SERVICE_ACCOUNT_NAME:-$DEFAULT_SERVICE_ACCOUNT_NAME}

echo ""
echo -e "${GREEN}Configuration:${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Account: $SERVICE_ACCOUNT_NAME"
echo ""

read -p "Continue with this configuration? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

# Set the project
echo -e "${BLUE}🔧 Setting up Google Cloud Project${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔌 Enabling required APIs${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    logging.googleapis.com \
    monitoring.googleapis.com

# Create service account for GitHub Actions
echo -e "${BLUE}👤 Creating service account for GitHub Actions${NC}"
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="GitHub Actions Deployment Service Account" \
    --description="Service account for deploying to Cloud Run from GitHub Actions" || true

# Grant necessary permissions to the service account
echo -e "${BLUE}🔐 Granting permissions to service account${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"

# Create and download service account key
echo -e "${BLUE}🔑 Creating service account key${NC}"
KEY_FILE="$SERVICE_ACCOUNT_NAME-key.json"
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

echo -e "${GREEN}✅ Service account key created: $KEY_FILE${NC}"

# Generate a random suffix for service names
SERVICE_SUFFIX=$(openssl rand -hex 4)

echo ""
echo -e "${GREEN}✅ Google Cloud setup completed!${NC}"
echo ""

# Setup GitHub secrets if gh CLI is available
if [ "$GH_AVAILABLE" = true ]; then
    echo -e "${BLUE}🐙 Setting up GitHub secrets${NC}"
    
    # Check if we're in a git repository
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "Setting GitHub repository secrets..."
        
        # Set secrets
        gh secret set GCP_PROJECT_ID --body="$PROJECT_ID"
        gh secret set GCP_SA_KEY --body="$(cat $KEY_FILE)"
        gh secret set GCP_SERVICE_SUFFIX --body="$SERVICE_SUFFIX"
        
        echo -e "${GREEN}✅ GitHub secrets configured!${NC}"
    else
        echo -e "${YELLOW}⚠️  Not in a git repository. Please set GitHub secrets manually.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub CLI not available. Please set the following GitHub secrets manually:${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "• Google Cloud Project: $PROJECT_ID"
echo "• Region: $REGION"
echo "• Service Account: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
echo "• Service Account Key: $KEY_FILE"
echo "• Service Suffix: $SERVICE_SUFFIX"
echo ""

if [ "$GH_AVAILABLE" = false ] || ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${YELLOW}📝 GitHub Secrets to set manually:${NC}"
    echo "• GCP_PROJECT_ID: $PROJECT_ID"
    echo "• GCP_SA_KEY: $(cat $KEY_FILE)"
    echo "• GCP_SERVICE_SUFFIX: $SERVICE_SUFFIX"
    echo "• NEXT_PUBLIC_SUPABASE_URL: (your production Supabase URL)"
    echo "• NEXT_PUBLIC_SUPABASE_ANON_KEY: (your production Supabase anon key)"
    echo "• NEXT_PUBLIC_SUPABASE_URL_STAGING: (your staging Supabase URL)"
    echo "• NEXT_PUBLIC_SUPABASE_ANON_KEY_STAGING: (your staging Supabase anon key)"
    echo ""
fi

echo -e "${BLUE}🚀 Next steps:${NC}"
echo "1. Set up Google Cloud Secret Manager secrets for your environment variables"
echo "2. Set GitHub repository secrets (if not done automatically)"
echo "3. Commit and push the workflow files to your repository"
echo "4. Push to 'main' branch to trigger production deployment"
echo "5. Push to 'stage' branch to trigger staging deployment"
echo ""

echo -e "${YELLOW}🤐 Don't forget to create these Secret Manager secrets:${NC}"
echo "• DATABASE_URL_PROD"
echo "• DATABASE_URL_STAGING" 
echo "• SUPABASE_SERVICE_ROLE_KEY_PROD"
echo "• SUPABASE_SERVICE_ROLE_KEY_STAGING"
echo "• NEW_RELIC_LICENSE_KEY"
echo ""

echo -e "${RED}🔒 Security Note:${NC}"
echo "• Store the service account key file ($KEY_FILE) securely"
echo "• Consider deleting it after setting up GitHub secrets"
echo "• Rotate the key periodically for better security"

# Cleanup prompt
echo ""
read -p "Delete the service account key file now? (recommended if GitHub secrets are set) (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f $KEY_FILE
    echo -e "${GREEN}✅ Service account key file deleted${NC}"
fi

echo -e "${GREEN}🎉 All done! Happy deploying!${NC}"
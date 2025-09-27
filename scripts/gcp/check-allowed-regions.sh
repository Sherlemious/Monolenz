#!/bin/bash

# Check which regions are allowed for Artifact Registry in your project
echo "🔍 Checking allowed regions for Artifact Registry..."

PROJECT_ID=$(gcloud config get-value project)
echo "Project: $PROJECT_ID"
echo ""

# Check organization policies
echo "📋 Checking organization policies..."
gcloud resource-manager org-policies list \
    --project=$PROJECT_ID \
    --filter="constraint:constraints/gcp.resourceLocations" \
    --format="table(constraint,listPolicy.allowedValues,listPolicy.deniedValues)" 2>/dev/null || echo "No location restrictions found at org level"

echo ""

# List available regions for Artifact Registry
echo "🌍 Available regions for Artifact Registry:"
gcloud artifacts locations list --format="table(name,displayName)" | head -50

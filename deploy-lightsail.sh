#!/bin/bash

# Nimbus AWS Lightsail Deployment Script
# ======================================
# This script deploys Nimbus with PostgreSQL support

set -e

# Configuration
SERVICE_NAME="nimbus-quiz"
CONTAINER_NAME="nimbus"
AWS_REGION="${AWS_REGION:-us-east-1}"
POWER="nano"  # nano, micro, small, medium, large, xlarge

echo "Deploying Nimbus to AWS Lightsail"
echo "======================================"

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."

    if ! command -v aws &> /dev/null; then
        echo "ERROR: AWS CLI is not installed. Please install it first."
        echo "   brew install awscli"
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        echo "ERROR: Docker is not installed. Please install it first."
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        echo "ERROR: AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "ERROR: ANTHROPIC_API_KEY environment variable is not set."
        echo "   export ANTHROPIC_API_KEY=your-api-key"
        exit 1
    fi

    echo "All prerequisites met!"
}

# Build Docker image
build_image() {
    echo ""
    echo "Building Docker image..."
    docker build -t $CONTAINER_NAME:latest .
    echo "Docker image built successfully!"
}

# Create Lightsail container service (if not exists)
create_service() {
    echo ""
    echo "Setting up Lightsail container service..."

    # Check if service exists
    if aws lightsail get-container-services --service-name $SERVICE_NAME --region $AWS_REGION &> /dev/null; then
        echo "   Service '$SERVICE_NAME' already exists."
    else
        echo "   Creating new container service..."
        aws lightsail create-container-service \
            --service-name $SERVICE_NAME \
            --power $POWER \
            --scale 1 \
            --region $AWS_REGION

        echo "   Waiting for service to be ready..."
        sleep 30
    fi

    echo "Container service ready!"
}

# Push image to Lightsail
push_image() {
    echo ""
    echo "Pushing image to Lightsail..."

    aws lightsail push-container-image \
        --service-name $SERVICE_NAME \
        --label $CONTAINER_NAME \
        --image $CONTAINER_NAME:latest \
        --region $AWS_REGION

    # Get the pushed image name
    IMAGE_NAME=$(aws lightsail get-container-images \
        --service-name $SERVICE_NAME \
        --region $AWS_REGION \
        --query 'containerImages[0].image' \
        --output text)

    echo "Image pushed: $IMAGE_NAME"
}

# Deploy the container
deploy() {
    echo ""
    echo "Deploying container..."

    # Get the latest image
    IMAGE_NAME=$(aws lightsail get-container-images \
        --service-name $SERVICE_NAME \
        --region $AWS_REGION \
        --query 'containerImages[0].image' \
        --output text)

    # Database configuration
    # For production, these should be set to your RDS or Lightsail DB instance
    DB_HOST="${DB_HOST:-}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-nimbus}"
    DB_USER="${DB_USER:-nimbus}"
    DB_PASSWORD="${DB_PASSWORD:-}"
    DB_SSL="${DB_SSL:-true}"

    # Create deployment configuration
    cat > /tmp/lightsail-deployment.json << EOF
{
    "containers": {
        "$CONTAINER_NAME": {
            "image": "$IMAGE_NAME",
            "ports": {
                "3001": "HTTP"
            },
            "environment": {
                "NODE_ENV": "production",
                "PORT": "3001",
                "ANTHROPIC_API_KEY": "$ANTHROPIC_API_KEY",
                "DB_HOST": "$DB_HOST",
                "DB_PORT": "$DB_PORT",
                "DB_NAME": "$DB_NAME",
                "DB_USER": "$DB_USER",
                "DB_PASSWORD": "$DB_PASSWORD",
                "DB_SSL": "$DB_SSL"
            }
        }
    },
    "publicEndpoint": {
        "containerName": "$CONTAINER_NAME",
        "containerPort": 3001,
        "healthCheck": {
            "healthyThreshold": 2,
            "unhealthyThreshold": 2,
            "timeoutSeconds": 5,
            "intervalSeconds": 10,
            "path": "/api/topics",
            "successCodes": "200"
        }
    }
}
EOF

    # Deploy
    aws lightsail create-container-service-deployment \
        --service-name $SERVICE_NAME \
        --cli-input-json file:///tmp/lightsail-deployment.json \
        --region $AWS_REGION

    rm /tmp/lightsail-deployment.json

    echo "Deployment initiated!"
}

# Get service URL
get_url() {
    echo ""
    echo "Getting service URL..."

    # Wait for deployment
    echo "   Waiting for deployment to complete (this may take a few minutes)..."

    for i in {1..30}; do
        STATE=$(aws lightsail get-container-services \
            --service-name $SERVICE_NAME \
            --region $AWS_REGION \
            --query 'containerServices[0].state' \
            --output text)

        if [ "$STATE" == "RUNNING" ]; then
            break
        fi

        echo "   Status: $STATE (attempt $i/30)"
        sleep 10
    done

    URL=$(aws lightsail get-container-services \
        --service-name $SERVICE_NAME \
        --region $AWS_REGION \
        --query 'containerServices[0].url' \
        --output text)

    echo ""
    echo "======================================"
    echo "Deployment Complete!"
    echo "======================================"
    echo ""
    echo "Your Nimbus app is available at:"
    echo "  $URL"
    echo ""
    echo "Note: It may take a few minutes for the service to be fully available."
    echo ""
    echo "IMPORTANT: To enable progress tracking, set up a PostgreSQL database:"
    echo "  1. Create a Lightsail Database or RDS PostgreSQL instance"
    echo "  2. Set the following environment variables and redeploy:"
    echo "     - DB_HOST: Your database hostname"
    echo "     - DB_PASSWORD: Your database password"
    echo ""
}

# Print usage
print_usage() {
    echo "Usage: ./deploy-lightsail.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --with-db    Deploy with database configuration"
    echo "  --help       Show this help message"
    echo ""
    echo "Required environment variables:"
    echo "  ANTHROPIC_API_KEY  Your Anthropic API key"
    echo ""
    echo "Optional environment variables for database:"
    echo "  DB_HOST      PostgreSQL host (e.g., your-db.xxx.us-east-1.rds.amazonaws.com)"
    echo "  DB_PORT      PostgreSQL port (default: 5432)"
    echo "  DB_NAME      Database name (default: nimbus)"
    echo "  DB_USER      Database user (default: nimbus)"
    echo "  DB_PASSWORD  Database password"
    echo "  DB_SSL       Enable SSL (default: true for production)"
}

# Main deployment flow
main() {
    if [ "$1" == "--help" ]; then
        print_usage
        exit 0
    fi

    check_prerequisites
    build_image
    create_service
    push_image
    deploy
    get_url
}

# Run
main "$@"

#!/bin/bash

# Nimbus AWS Lightsail Instance Deployment Script
# ================================================
# Deploys to a Lightsail VPS instance (no Docker required)

set -e

# Configuration
INSTANCE_NAME="nimbus-quiz"
BLUEPRINT_ID="amazon_linux_2023"  # Amazon Linux 2023
BUNDLE_ID="nano_3_0"  # $3.50/month - 512MB RAM, 1 vCPU
AWS_REGION="${AWS_REGION:-us-east-1}"
KEY_PAIR_NAME="nimbus-key-2"

echo "Deploying Nimbus to AWS Lightsail Instance"
echo "==========================================="

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."

    if ! command -v aws &> /dev/null; then
        echo "ERROR: AWS CLI is not installed."
        echo "   brew install awscli"
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        echo "ERROR: AWS CLI is not configured. Run 'aws configure' first."
        exit 1
    fi

    if [ -z "$ANTHROPIC_API_KEY" ]; then
        echo "ERROR: ANTHROPIC_API_KEY environment variable is not set."
        echo "   export ANTHROPIC_API_KEY=your-api-key"
        exit 1
    fi

    echo "All prerequisites met!"
}

# Create key pair if it doesn't exist
create_key_pair() {
    echo ""
    echo "Setting up SSH key pair..."

    if aws lightsail get-key-pair --key-pair-name $KEY_PAIR_NAME --region $AWS_REGION &> /dev/null; then
        echo "   Key pair '$KEY_PAIR_NAME' already exists."
    else
        echo "   Creating new key pair..."
        aws lightsail create-key-pair \
            --key-pair-name $KEY_PAIR_NAME \
            --region $AWS_REGION \
            --query 'privateKeyBase64' \
            --output text | base64 -d > ~/.ssh/${KEY_PAIR_NAME}.pem

        chmod 600 ~/.ssh/${KEY_PAIR_NAME}.pem
        echo "   Key saved to ~/.ssh/${KEY_PAIR_NAME}.pem"
    fi
}

# Create Lightsail instance
create_instance() {
    echo ""
    echo "Creating Lightsail instance..."

    # Check if instance exists
    if aws lightsail get-instance --instance-name $INSTANCE_NAME --region $AWS_REGION &> /dev/null; then
        echo "   Instance '$INSTANCE_NAME' already exists."
        return 0
    fi

    # User data script to run on instance creation
    USER_DATA=$(cat << 'USERDATA'
#!/bin/bash
set -e

# Update system
sudo dnf update -y

# Install Node.js 20
sudo dnf install -y nodejs20 npm

# Install git
sudo dnf install -y git

# Install PM2 globally
sudo npm install -g pm2

# Create app directory
sudo mkdir -p /var/www/nimbus
sudo chown -R ec2-user:ec2-user /var/www/nimbus

echo "Instance setup complete!"
USERDATA
)

    echo "   Creating instance (this may take a minute)..."
    aws lightsail create-instances \
        --instance-names $INSTANCE_NAME \
        --availability-zone "${AWS_REGION}a" \
        --blueprint-id $BLUEPRINT_ID \
        --bundle-id $BUNDLE_ID \
        --key-pair-name $KEY_PAIR_NAME \
        --user-data "$USER_DATA" \
        --region $AWS_REGION

    echo "   Waiting for instance to be running..."
    sleep 60

    # Wait for instance to be running
    for i in {1..30}; do
        STATE=$(aws lightsail get-instance \
            --instance-name $INSTANCE_NAME \
            --region $AWS_REGION \
            --query 'instance.state.name' \
            --output text)

        if [ "$STATE" == "running" ]; then
            echo "   Instance is running!"
            break
        fi
        echo "   Status: $STATE (attempt $i/30)"
        sleep 10
    done
}

# Open firewall ports
configure_firewall() {
    echo ""
    echo "Configuring firewall..."

    aws lightsail open-instance-public-ports \
        --instance-name $INSTANCE_NAME \
        --port-info fromPort=80,toPort=80,protocol=tcp \
        --region $AWS_REGION 2>/dev/null || true

    aws lightsail open-instance-public-ports \
        --instance-name $INSTANCE_NAME \
        --port-info fromPort=443,toPort=443,protocol=tcp \
        --region $AWS_REGION 2>/dev/null || true

    aws lightsail open-instance-public-ports \
        --instance-name $INSTANCE_NAME \
        --port-info fromPort=3001,toPort=3001,protocol=tcp \
        --region $AWS_REGION 2>/dev/null || true

    echo "   Ports 80, 443, 3001 opened."
}

# Allocate static IP
allocate_static_ip() {
    echo ""
    echo "Setting up static IP..."

    STATIC_IP_NAME="${INSTANCE_NAME}-ip"

    # Check if static IP exists
    if aws lightsail get-static-ip --static-ip-name $STATIC_IP_NAME --region $AWS_REGION &> /dev/null; then
        echo "   Static IP already exists."
    else
        echo "   Allocating static IP..."
        aws lightsail allocate-static-ip \
            --static-ip-name $STATIC_IP_NAME \
            --region $AWS_REGION

        echo "   Attaching static IP to instance..."
        aws lightsail attach-static-ip \
            --static-ip-name $STATIC_IP_NAME \
            --instance-name $INSTANCE_NAME \
            --region $AWS_REGION
    fi

    STATIC_IP=$(aws lightsail get-static-ip \
        --static-ip-name $STATIC_IP_NAME \
        --region $AWS_REGION \
        --query 'staticIp.ipAddress' \
        --output text)

    echo "   Static IP: $STATIC_IP"
}

# Deploy application code
deploy_code() {
    echo ""
    echo "Deploying application code..."

    # Get instance IP
    IP=$(aws lightsail get-instance \
        --instance-name $INSTANCE_NAME \
        --region $AWS_REGION \
        --query 'instance.publicIpAddress' \
        --output text)

    SSH_KEY="$HOME/.ssh/${KEY_PAIR_NAME}.pem"

    if [ ! -f "$SSH_KEY" ]; then
        echo "ERROR: SSH key not found at $SSH_KEY"
        echo "You may need to download it from AWS Console or recreate the instance."
        exit 1
    fi

    echo "   Waiting for SSH to be available..."
    for i in {1..30}; do
        if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "$SSH_KEY" ec2-user@$IP "echo 'SSH ready'" 2>/dev/null; then
            break
        fi
        echo "   Waiting for SSH... (attempt $i/30)"
        sleep 10
    done

    echo "   Building production bundle locally..."
    npm run build

    echo "   Syncing files to server..."

    # Create a tarball of needed files
    tar -czf /tmp/nimbus-deploy.tar.gz \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=.env \
        dist server public package.json package-lock.json

    # Upload and extract
    scp -o StrictHostKeyChecking=no -i "$SSH_KEY" /tmp/nimbus-deploy.tar.gz ec2-user@$IP:/tmp/

    ssh -o StrictHostKeyChecking=no -i "$SSH_KEY" ec2-user@$IP << REMOTE
        set -e
        cd /var/www/nimbus
        tar -xzf /tmp/nimbus-deploy.tar.gz
        npm ci --omit=dev

        # Create environment file
        cat > .env << ENV
NODE_ENV=production
PORT=3001
ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
ENV

        # Start/restart with PM2
        pm2 delete nimbus 2>/dev/null || true
        pm2 start server/index.js --name nimbus
        pm2 save
        pm2 startup | tail -1 | sudo bash 2>/dev/null || true

        echo "Application deployed!"
REMOTE

    rm /tmp/nimbus-deploy.tar.gz

    echo "   Code deployed successfully!"
}

# Print final info
print_info() {
    IP=$(aws lightsail get-instance \
        --instance-name $INSTANCE_NAME \
        --region $AWS_REGION \
        --query 'instance.publicIpAddress' \
        --output text)

    echo ""
    echo "==========================================="
    echo "Deployment Complete!"
    echo "==========================================="
    echo ""
    echo "Your Nimbus app is available at:"
    echo "  http://$IP:3001"
    echo ""
    echo "SSH access:"
    echo "  ssh -i ~/.ssh/${KEY_PAIR_NAME}.pem ec2-user@$IP"
    echo ""
    echo "View logs:"
    echo "  ssh -i ~/.ssh/${KEY_PAIR_NAME}.pem ec2-user@$IP 'pm2 logs nimbus'"
    echo ""
    echo "Monthly cost: ~\$3.50 (nano instance) + \$3 (static IP) = ~\$6.50"
    echo ""
}

# Main
main() {
    check_prerequisites
    create_key_pair
    create_instance
    configure_firewall
    allocate_static_ip
    deploy_code
    print_info
}

main

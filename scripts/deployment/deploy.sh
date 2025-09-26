#!/bin/bash

# Deployment script for UptimeMatrix
# This script handles the deployment process on EC2

set -e

DEPLOY_DIR="/opt/uptimematrix/current"
BACKUP_DIR="/opt/uptimematrix/backup"
LOG_DIR="/var/log/uptimematrix"

echo "🚀 Starting UptimeMatrix deployment..."

# Create log directory if it doesn't exist
mkdir -p $LOG_DIR

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_DIR/deploy.log
}

# Function to rollback on failure
rollback() {
    log "❌ Deployment failed. Rolling back..."
    pm2 stop all || true
    
    if [ -d "$BACKUP_DIR" ]; then
        rm -rf $DEPLOY_DIR
        mv $BACKUP_DIR $DEPLOY_DIR
        cd $DEPLOY_DIR
        pm2 start ecosystem.config.js
        log "✅ Rollback completed"
    else
        log "⚠️  No backup found for rollback"
    fi
    exit 1
}

# Set trap for rollback on error
trap rollback ERR

# Stop existing services
log "Stopping existing services..."
pm2 stop all || true

# Backup current deployment
log "Creating backup..."
if [ -d "$DEPLOY_DIR" ]; then
    rm -rf $BACKUP_DIR || true
    mv $DEPLOY_DIR $BACKUP_DIR
fi

# Wait for services to stop
sleep 5

log "✅ Deployment preparation completed"

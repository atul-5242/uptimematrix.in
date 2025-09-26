#!/bin/bash

# EC2 Setup Script for UptimeMatrix Production Deployment
# Run this script on your EC2 instance to prepare it for deployment

set -e

echo "🚀 Setting up EC2 instance for UptimeMatrix deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo sed -i 's/^supervised no/supervised systemd/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf

# Start and enable Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Install PM2 globally
sudo npm install -g pm2

# Create application directories
sudo mkdir -p /opt/uptimematrix/{current,backup}
sudo mkdir -p /var/log/uptimematrix

# Set permissions
sudo chown -R $USER:$USER /opt/uptimematrix
sudo chown -R $USER:$USER /var/log/uptimematrix

# Setup PM2 startup
pm2 startup
echo "⚠️  Run the command shown above to setup PM2 startup"

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/uptimematrix << 'EOF'
server {
    listen 80;
    server_name api.uptimematrix.atulmaurya.in;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Default location for other requests
    location / {
        return 404;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/uptimematrix /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Setup UFW firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create swap file for t2.micro (helps with memory)
sudo fallocate -l 1G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Setup log rotation
sudo tee /etc/logrotate.d/uptimematrix << 'EOF'
/var/log/uptimematrix/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

echo "✅ EC2 setup completed!"
echo ""
echo "Next steps:"
echo "1. Update /etc/nginx/sites-available/uptimematrix with your domain"
echo "2. Setup SSL certificate (recommended: certbot)"
echo "3. Configure GitHub secrets for deployment"
echo "4. Test Redis: redis-cli ping"
echo "5. Check services: sudo systemctl status redis-server nginx"

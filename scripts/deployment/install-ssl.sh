#!/bin/bash

# SSL Certificate Installation Script using Let's Encrypt
# Run this after basic EC2 setup to secure your domain

set -e

DOMAIN=${1:-"your-domain.com"}

if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "❌ Please provide your domain name as argument"
    echo "Usage: ./install-ssl.sh yourdomain.com"
    exit 1
fi

echo "🔒 Installing SSL certificate for $DOMAIN..."

# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Test auto-renewal
sudo certbot renew --dry-run

# Update Nginx configuration for better security
sudo tee /etc/nginx/snippets/ssl-params.conf << 'EOF'
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_dhparam /etc/nginx/dhparam.pem;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
ssl_ecdh_curve secp384r1;
ssl_session_timeout  10m;
ssl_session_cache shared:SSL:10m;
ssl_session_tickets off;
ssl_stapling on;
ssl_stapling_verify on;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
EOF

# Generate DHParam
sudo openssl dhparam -out /etc/nginx/dhparam.pem 2048

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx

echo "✅ SSL certificate installed successfully!"
echo "Your site is now accessible at https://$DOMAIN"

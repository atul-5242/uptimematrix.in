#!/bin/bash

# Monitoring script for UptimeMatrix services
# Run this script to check the health of all services

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 UptimeMatrix Service Health Check"
echo "=================================="

# Check PM2 processes
echo -e "\n📊 PM2 Process Status:"
pm2 status

# Check Redis
echo -e "\n🔴 Redis Status:"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
    redis-cli info memory | grep used_memory_human
else
    echo -e "${RED}❌ Redis is not responding${NC}"
fi

# Check Nginx
echo -e "\n🌐 Nginx Status:"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi

# Check API health
echo -e "\n🚀 API Health Check:"
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is responding${NC}"
    curl -s http://localhost:3001/health | jq '.' 2>/dev/null || echo "API response received"
else
    echo -e "${RED}❌ API is not responding${NC}"
fi

# Check disk space
echo -e "\n💾 Disk Usage:"
df -h / | tail -1 | awk '{print $5 " used of " $2}'

# Check memory usage
echo -e "\n🧠 Memory Usage:"
free -h | grep Mem | awk '{print $3 "/" $2 " (" int($3/$2*100) "%)"}'

# Check system load
echo -e "\n⚡ System Load:"
uptime

# Check logs for errors (last 10 lines)
echo -e "\n📝 Recent Error Logs:"
if [ -f "/var/log/uptimematrix/api-error.log" ]; then
    echo "API Errors (last 5 lines):"
    tail -5 /var/log/uptimematrix/api-error.log 2>/dev/null || echo "No recent API errors"
fi

if [ -f "/var/log/uptimematrix/pusher-error.log" ]; then
    echo "Pusher Errors (last 5 lines):"
    tail -5 /var/log/uptimematrix/pusher-error.log 2>/dev/null || echo "No recent Pusher errors"
fi

if [ -f "/var/log/uptimematrix/worker-error.log" ]; then
    echo "Worker Errors (last 5 lines):"
    tail -5 /var/log/uptimematrix/worker-error.log 2>/dev/null || echo "No recent Worker errors"
fi

echo -e "\n=================================="
echo "Health check completed at $(date)"

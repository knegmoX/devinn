# DevInn GCP VM Deployment Plan

## Current Status
- **Date**: 2025-08-27 04:23 UTC
- **Target VM**: movieclip-vm (asia-east1-a, project: t0617-2)
- **VM External IP**: 104.199.169.138
- **Network Tag**: movieclip-server
- **Deployment Package**: devinn-deployment.tar.gz (317K)

## Access Restrictions Encountered
Similar to the previous deployment attempts, we're encountering corporate network security restrictions:

1. **SSH Access**: Location restrictions preventing direct SSH access to GCP VMs
2. **Cloud Storage**: Hardware security key authentication required (hidraw device not available)
3. **Network Policies**: Corporate firewall blocking external VM connections

## Deployment Package Ready
✅ **Created**: `devinn-deployment.tar.gz` (317K)
- Excludes: node_modules, .next, .git, logs, build artifacts
- Includes: Complete source code, configuration files, documentation

## Required Steps for Deployment (When Access Available)

### 1. Transfer Deployment Package
```bash
# Option A: Direct SCP (requires proper authentication)
gcloud compute scp devinn-deployment.tar.gz movieclip-vm:~/ --zone=asia-east1-a --project=t0617-2

# Option B: Via Cloud Storage (alternative method)
gsutil cp devinn-deployment.tar.gz gs://[bucket-name]/
gcloud compute ssh movieclip-vm --zone=asia-east1-a --project=t0617-2 --command="gsutil cp gs://[bucket-name]/devinn-deployment.tar.gz ~/"
```

### 2. VM Environment Setup
```bash
# Connect to VM
gcloud compute ssh movieclip-vm --zone=asia-east1-a --project=t0617-2

# Extract deployment package
cd ~
tar -xzf devinn-deployment.tar.gz
cd devinn

# Install Node.js 18+ (if not present)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install project dependencies
npm install

# Install nginx (if not present)
sudo apt update
sudo apt install -y nginx
```

### 3. Environment Configuration
```bash
# Create production environment file
cp .env.example .env

# Edit .env with production values:
# - GEMINI_API_KEY=your_gemini_api_key
# - NODE_ENV=production
# - PORT=3000
# - Add any other required environment variables
```

### 4. Build and Start Application
```bash
# Build the application
npm run build

# Start with PM2
pm2 start npm --name "devinn" -- start
pm2 save
pm2 startup
```

### 5. Nginx Configuration
```bash
# Copy nginx configuration
sudo cp nginx-http-only.conf /etc/nginx/sites-available/devinn
sudo ln -s /etc/nginx/sites-available/devinn /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 6. Firewall Configuration
```bash
# Create firewall rule for HTTP traffic
gcloud compute firewall-rules create devinn-movieclip-http \
    --allow tcp:80 \
    --source-ranges 0.0.0.0/0 \
    --target-tags movieclip-server \
    --project=t0617-2

# Create firewall rule for HTTPS traffic (if needed later)
gcloud compute firewall-rules create devinn-movieclip-https \
    --allow tcp:443 \
    --source-ranges 0.0.0.0/0 \
    --target-tags movieclip-server \
    --project=t0617-2
```

### 7. Verification Steps
```bash
# Check application status
pm2 status
pm2 logs devinn

# Check nginx status
sudo systemctl status nginx

# Test local connectivity
curl http://localhost:3000
curl http://localhost

# Test external connectivity
curl http://104.199.169.138
```

## Application Architecture Summary

### Core Components
- **Framework**: Next.js 15.5.0 with Turbopack
- **AI Engine**: Gemini 2.5 Pro integration
- **Content Extraction**: Support for 小红书, B站, 抖音, 马蜂窝
- **Booking Integration**: Flight and hotel search APIs
- **UI**: React with Tailwind CSS and Radix UI components

### API Endpoints (All Dynamic)
- `/api/ai/analyze` - Content analysis
- `/api/ai/generate-plan` - Travel plan generation
- `/api/ai/recommend` - AI recommendations
- `/api/content/extract` - Content extraction from social platforms
- `/api/booking/flights/search` - Flight search
- `/api/booking/hotels/search` - Hotel search

### Key Features
- Dynamic travel document generation
- AI-powered content analysis
- Multi-platform content extraction
- Flight and hotel booking integration
- Real-time travel plan updates
- Mobile-responsive design

## Security Considerations
- Environment variables for API keys
- CORS configuration for external access
- Rate limiting on API endpoints
- Input validation and sanitization
- Secure headers in nginx configuration

## Monitoring and Maintenance
- PM2 process monitoring
- Nginx access and error logs
- Application logs via PM2
- Regular dependency updates
- Performance monitoring

## Next Steps
1. **Resolve Access Issues**: Work with IT/Security team to enable GCP VM access
2. **Execute Deployment**: Follow the steps above when access is restored
3. **Domain Configuration**: Set up proper domain pointing to 104.199.169.138
4. **SSL Certificate**: Configure HTTPS with Let's Encrypt or corporate certificates
5. **Internal Testing**: Conduct comprehensive testing with internal users

## Alternative Deployment Options
If corporate restrictions persist:
1. **Local Development Server**: Continue using current server for internal testing
2. **Different Cloud Provider**: Consider AWS, Azure, or other providers
3. **Container Deployment**: Use Docker containers for easier deployment
4. **CI/CD Pipeline**: Set up automated deployment when restrictions are lifted

## Contact Information
- **VM Details**: movieclip-vm (104.199.169.138)
- **Project**: t0617-2
- **Zone**: asia-east1-a
- **Deployment Package**: Ready and tested (317K)

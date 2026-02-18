# Docker Deployment Guide for Currency Converter

This guide explains how to build and run your Currency Converter app using Docker.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) (optional, comes with Docker Desktop)

## Quick Start with Docker Compose (Recommended)

### 1. Build and Run the Container

```bash
docker-compose up --build
```

Your app will be available at: **http://localhost:3000**

### 2. Stop the Container

```bash
docker-compose down
```

---

## Manual Docker Commands

### Build the Docker Image

```bash
docker build -t currency-converter:latest .
```

### Run the Container

```bash
docker run -d -p 3000:80 --name currency-converter currency-converter:latest
```

### View Container Logs

```bash
docker logs currency-converter
```

### Stop the Container

```bash
docker stop currency-converter
```

### Remove the Container

```bash
docker rm currency-converter
```

---

## File Descriptions

### **Dockerfile**
- Multi-stage build for optimized production image
- Stage 1: Builds your React app with Node.js
- Stage 2: Serves with Nginx (lightweight web server)
- Includes health checks
- Final image size: ~50MB

### **docker-compose.yml**
- Orchestrates container configuration
- Sets up networking
- Configures port mapping (3000:80)
- Includes automatic restart policy
- Health check integration

### **.dockerignore**
- Excludes unnecessary files from Docker image
- Reduces build time and image size
- Similar to .gitignore for Docker

### **nginx.conf**
- Production-ready web server configuration
- Gzip compression enabled
- Security headers included
- SPA routing support (handles React routing)
- Static asset caching
- Health endpoint

---

## Advanced Configuration

### Run on Different Port

```bash
docker run -d -p 8080:80 --name currency-converter currency-converter:latest
```

Access at: **http://localhost:8080**

### Run with Environment Variables

```bash
docker run -d -p 3000:80 \
  -e NODE_ENV=production \
  --name currency-converter \
  currency-converter:latest
```

### Run in Background with Logs

```bash
docker run -d -p 3000:80 --name currency-converter currency-converter:latest
docker logs -f currency-converter
```

---

## Deployment to Production Server

### 1. On Your Server (Linux/Ubuntu)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone your repo or upload files
git clone <your-repo-url>
cd typescript-react

# Run with Docker Compose
docker-compose up -d
```

### 2. With Reverse Proxy (Nginx/Apache)

Point your domain to your server's IP, then configure reverse proxy to forward to port 3000.

### 3. With SSL (Let's Encrypt)

Update docker-compose.yml to use separate reverse proxy container with SSL support.

---

## Monitoring

### Check Container Status

```bash
docker ps
```

### View Health Status

```bash
docker inspect --format='{{.State.Health.Status}}' currency-converter
```

### View Real-time Logs

```bash
docker logs -f currency-converter
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
docker run -d -p 8080:80 currency-converter:latest
```

### Build Fails

```bash
# Clean build (no cache)
docker-compose build --no-cache

# View build logs
docker build -t currency-converter:latest . --verbose
```

### Container Exits Immediately

```bash
# Check logs
docker logs currency-converter

# Run interactively
docker run -it currency-converter:latest
```

---

## Performance Notes

- **Image Size**: ~50MB (optimized with Alpine Linux)
- **Build Time**: ~2-3 minutes (first build)
- **Memory Usage**: ~50-100MB at runtime
- **CPU Usage**: Minimal (only when serving requests)

---

## Security Features Included

✅ Security headers (X-Frame-Options, CSP, etc.)
✅ Gzip compression
✅ Health checks
✅ Non-root process execution (Nginx)
✅ Denial of hidden files
✅ HTTPS-ready configuration

---

## Next Steps

1. **Test locally**: `docker-compose up --build`
2. **Verify app works**: Visit http://localhost:3000
3. **Push to registry**: `docker push your-registry/currency-converter:latest`
4. **Deploy to cloud**: AWS ECS, Kubernetes, DigitalOcean, etc.

For production deployment to cloud platforms, let me know and I can help with additional configurations!

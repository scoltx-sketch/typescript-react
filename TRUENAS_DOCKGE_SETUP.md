# TrueNAS Scale + Dockge Setup Guide for Currency Converter

This guide provides step-by-step instructions for deploying the Currency Converter app on TrueNAS Scale using Dockge.

## What is Dockge?

Dockge is a web UI for Docker Compose management. It allows you to manage Docker containers directly from TrueNAS Scale without using the command line.

---

## Prerequisites

1. **TrueNAS Scale** installed and running
2. **Dockge** installed on TrueNAS Scale (Install from Community Apps or manually)
3. **Git** access (to clone the repo or upload files)

---

## Step 1: Prepare Your Files

### Option A: Using Git Clone (Recommended)

```bash
# SSH into your TrueNAS Scale system
ssh root@your-truenas-ip

# Navigate to a persistent location
cd /mnt/pool-name/apps/  # Replace 'pool-name' with your pool name

# Clone the repository
git clone https://github.com/your-username/typescript-react.git
cd typescript-react
```

### Option B: Manual Upload

1. Use SFTP to connect to your TrueNAS
2. Upload the entire project to `/mnt/pool-name/apps/typescript-react`

---

## Step 2: Set Up in Dockge

### Access Dockge

1. Open your browser
2. Go to `http://your-truenas-ip:5001` (default Dockge port)
3. Log in with your credentials

### Create a New Stack

1. Click **"New Stack"** button
2. Enter **Stack Name**: `currency-converter`
3. In the **docker-compose** editor, paste the contents of `docker-compose.yml`:

```yaml
version: '3.8'

services:
  currency-converter:
    image: currency-converter:latest
    build:
      context: /mnt/pool-name/apps/typescript-react
      dockerfile: Dockerfile
    container_name: currency-converter-app
    hostname: currency-converter
    
    ports:
      - "3000:80"
    
    environment:
      - NODE_ENV=production
      - TZ=UTC
    
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    
    restart: unless-stopped
    
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 10s
    
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    
    networks:
      - currency-network

networks:
  currency-network:
    driver: bridge
```

### Update Paths

Replace `pool-name` with your actual TrueNAS pool name. Common paths:
- `/mnt/tank/apps/typescript-react` (if pool is named "tank")
- `/mnt/data/apps/typescript-react` (if pool is named "data")

### Deploy the Stack

1. Click **"Deploy"** button
2. Wait for the build to complete (2-3 minutes)
3. Monitor logs in Dockge to ensure everything is working

---

## Step 3: Access Your Application

Once deployed, access your Currency Converter at:

```
http://your-truenas-ip:3000
```

---

## TrueNAS Scale Optimizations Included

✅ **Resource Management**
- CPU limit: 1.0 cores
- Memory limit: 512MB
- Memory reservation: 256MB

✅ **Logging**
- JSON file logging (10MB max per file, 3 file rotation)
- Prevents disk space issues

✅ **Health Checks**
- Automatic monitoring
- TrueNAS will restart container if it fails

✅ **Security**
- Non-root user (nginx)
- Proper permissions
- Alpine Linux (minimal attack surface)

✅ **Networking**
- Custom bridge network for isolation
- Easy port management

---

## Managing Your Stack in Dockge

### View Logs

1. Open Dockge dashboard
2. Click on **"currency-converter"** stack
3. View real-time logs

### Restart Container

1. Dockge dashboard → **"currency-converter"**
2. Click **"Restart"** button

### Stop Container

1. Dockge dashboard → **"currency-converter"**
2. Click **"Stop"** button

### Update Configuration

1. Edit the docker-compose.yml in Dockge
2. Click **"Update"**
3. Container will redeploy with new config

---

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Edit docker-compose.yml in Dockge
2. Change: `"3000:80"` to `"8000:80"` (or any free port)
3. Access app at: `http://your-truenas-ip:8000`

### Build Fails

1. Check Dockge logs for error messages
2. Verify file paths are correct
3. Ensure project folder exists in TrueNAS
4. Check disk space availability

### Container Keeps Restarting

1. Click on stack in Dockge
2. View logs to see errors
3. Common issues:
   - Insufficient memory
   - Port conflict
   - Incorrect Dockerfile path

### Cannot Access Application

1. Verify port is open: `telnet your-truenas-ip 3000`
2. Check firewall settings in TrueNAS
3. Verify container is running: Check Dockge dashboard
4. Check logs for errors

---

## Performance Tuning for TrueNAS

### Increase Memory for High Traffic

Edit docker-compose.yml:
```yaml
deploy:
  resources:
    limits:
      memory: 1024M  # Increase from 512M
    reservations:
      memory: 512M   # Increase from 256M
```

### Add CPU Cores for Multiple Users

```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'    # Increase from 1.0
    reservations:
      cpus: '1.0'    # Increase from 0.5
```

---

## Backup and Recovery

### Export Stack Configuration

1. In Dockge, your stack definition is saved
2. TrueNAS automatically backs up configuration
3. Keep a copy of docker-compose.yml in version control

### Restore

Simply re-create the stack in Dockge with the same configuration.

---

## Advanced: Update Application Code

### Pull Latest Changes

```bash
ssh root@your-truenas-ip
cd /mnt/pool-name/apps/typescript-react
git pull origin main
```

### Rebuild Image in Dockge

1. Open Dockge dashboard
2. Click **"currency-converter"** stack
3. Click **"Rebuild"** or **"Recreate"**
4. New image is built with latest code

---

## Accessing Outside Your Network

### Using TrueNAS Reverse Proxy

1. TrueNAS → Settings → Services → Reverse Proxy
2. Create new proxy pointing to `localhost:3000`
3. Add your domain name
4. Access via: `https://your-domain.com`

### Using Cloudflare Tunnel

1. Set up Cloudflare account
2. Create tunnel to `localhost:3000`
3. Access from anywhere securely

---

## Security Notes

✅ Container runs as non-root user
✅ Minimal attack surface (Alpine Linux)
✅ Health checks ensure stability
✅ Proper logging and monitoring
✅ Resource limits prevent DoS

For production use:
1. Use HTTPS (Reverse Proxy)
2. Enable authentication if needed
3. Monitor logs regularly
4. Keep TrueNAS and Dockge updated

---

## Next Steps

1. ✅ Deploy the stack
2. ✅ Access the application at port 3000
3. ✅ Monitor logs in Dockge
4. ✅ Set up reverse proxy for HTTPS
5. ✅ Configure domain name

---

## Getting Help

If you encounter issues:

1. Check Dockge logs first
2. Verify file paths in docker-compose.yml
3. Ensure sufficient disk space and memory
4. Check TrueNAS system logs
5. Verify network connectivity

For more Dockge help: https://github.com/louislam/dockge

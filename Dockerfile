# Multi-stage build optimized for TrueNAS Scale deployment

# Stage 1: Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --prefer-offline --no-audit

# Copy source code
COPY . .

# Build the React app for production
RUN npm run build

# Remove source files to reduce final image size
RUN rm -rf src public

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install curl for health checks in TrueNAS
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 101 -S nginx && \
    adduser -s /sbin/nologin -S -D -H -u 101 -h /var/cache/nginx -g nginx nginx

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx

# Switch to non-root user
USER nginx

# Expose port 80
EXPOSE 80

# Health check optimized for TrueNAS
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]


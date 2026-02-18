# Frontend Dockerfile
# Gulhaji Plaza Laptop Recommendation System
# Optimized for WSL2 environment

# Development stage
FROM node:20-alpine AS development
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 5173

# Enable polling for WSL2 file watching
ENV CHOKIDAR_USEPOLLING=true
ENV VITE_API_GATEWAY_URL=http://localhost:3000

# Run dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

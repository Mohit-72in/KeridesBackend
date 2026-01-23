# =======================
# Build Stage
# =======================
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files first for caching
COPY package*.json ./

# Install all dependencies
RUN npm ci --no-audit --no-fund

# Copy all source files including tsconfig.json
COPY . .

# Build NestJS app (increase memory for large builds)
RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

# =======================
# Production Stage
# =======================
FROM node:18-alpine AS prod

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Copy only the build output and package files from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production --no-audit --no-fund

# Optional: Flatten dist/src if NestJS outputs nested folder
RUN if [ -d dist/src ]; then mv dist/src/* dist/ || true; fi \
 && echo "dist contents:" && ls -la dist \
 && test -f dist/main.js || (echo "ERROR: dist/main.js not found" && false)

# Expose default NestJS port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]

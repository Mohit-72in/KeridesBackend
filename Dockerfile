# build stage
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# copy only package files first to cache installs
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# copy source and build
COPY . .
RUN npm run build

# prod stage
FROM node:18-alpine AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production

# copy built files and package files from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

# install only production deps
RUN npm ci --only=production --no-audit --no-fund

# handle dist layout differences (dist/src -> dist) and fail early if main.js missing
RUN if [ -d dist/src ]; then mv dist/src/* dist/ || true; fi \
 && echo "dist contents:" && ls -la dist \
 && test -f dist/main.js || (echo "ERROR: dist/main.js not found" && false)

EXPOSE 3000
CMD ["node", "dist/main.js"]

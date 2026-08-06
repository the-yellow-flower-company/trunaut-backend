# Build stage — dev dependencies present, TypeScript compiled to dist/.
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime stage — production dependencies only, no compiler, no sources.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist

# Never run as root. node:alpine ships an unprivileged `node` user already.
USER node

EXPOSE 8080
CMD ["node", "dist/index.js"]

# ---- Base image ----
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching).
# Full install (incl. the prisma CLI) is needed for `prisma generate` (postinstall)
# and `prisma migrate deploy` at startup.
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy the rest of the application
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# Apply migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]

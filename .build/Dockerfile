FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

FROM deps AS development
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

FROM deps AS build
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi
COPY prisma ./prisma
RUN npx prisma generate
COPY assets ./assets
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/main"]

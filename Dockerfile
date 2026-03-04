FROM node:18-slim as build
RUN npm install -g pnpm

WORKDIR /app
COPY package.json ./
COPY . .
RUN pnpm install
RUN pnpm run build

# Stage 2
FROM node:18-slim as prod

RUN npm install -g pnpm

WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/src/app ./src/app
COPY --from=build /app/next.config.mjs ./next.config.mjs
EXPOSE 3001
CMD [ "pnpm", "run" ,"start"]
FROM node:20-alpine AS base
RUN apk add --no-cache openssl
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS development
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
EXPOSE 4000
CMD ["pnpm", "--filter", "api", "dev"]

FROM base AS build
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages ./packages
RUN pnpm install --frozen-lockfile
COPY apps/api ./apps/api
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api... build

FROM base AS production
ENV NODE_ENV=production
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY --from=build /app/packages ./packages
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/prisma ./apps/api/prisma
RUN npx prisma@5.22.0 generate --schema=apps/api/prisma/schema.prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM caddy:2.8.4-alpine AS caddy
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /var/html/www

EXPOSE 80
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
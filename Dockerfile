FROM node:18-alpine AS builder
WORKDIR /canchu
COPY src src
COPY .env.json package-lock.json package.json tsconfig.json ./
RUN npm ci && \
    npx tsc && \
    npm ci --omit=dev --omit=optional && \
    npm cache clean --force


FROM node:18-alpine
WORKDIR /canchu
COPY --from=builder /canchu/dist ./dist
COPY --from=builder /canchu/node_modules ./node_modules
COPY --from=builder /canchu/package.json ./
EXPOSE 3000
CMD [ "node", "dist/src/index.js" ]

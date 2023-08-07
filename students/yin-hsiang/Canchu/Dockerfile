FROM node:18-alpine
WORKDIR /canchu
COPY src src
COPY test test
COPY .env.json package-lock.json package.json tsconfig.json ./
RUN npm ci && \
    npx tsc && \
    npm ci --omit=dev --omit=optional && \
    npm cache clean --force
EXPOSE 3000
CMD [ "node", "dist/src/index.js" ]

FROM node:18-alpine
WORKDIR /canchu
COPY . .
RUN npm ci && \
    npx tsc && \
    npm i --omit=dev && \
    npm cache clean --force
EXPOSE 3000
CMD [ "node", "dist/src/index.js" ]

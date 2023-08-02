FROM node:18-alpine
WORKDIR /canchu
COPY . .
RUN npm i && \
    npx tsc && \
    npm i --omit=dev
EXPOSE 3000
CMD [ "node", "dist/src/index.js" ]

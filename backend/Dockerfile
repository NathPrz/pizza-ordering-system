FROM node:22-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
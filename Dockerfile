FROM node:12

ENV PORT=80

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

CMD  ["node", "server.js"]
FROM node:12

ENV PORT=80
ENV DB_HOST=""
ENV DB_NAME=""
ENV DB_PASSWORD=""
ENV DB_USER=""
ENV PUBLIC_FOLDER="./public"

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

CMD  ["node", "server.js"]
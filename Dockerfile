FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g npm@9.2.0
RUN npm install
RUN npm ci --only=production

COPY . .
EXPOSE 3000

CMD sleep 5;node index.js

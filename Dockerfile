FROM node:16-slim

WORKDIR /src
COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000

CMD [ "node", "server.js" ]

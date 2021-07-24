FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 7000

ENV PORT=7000

CMD ["npm", "start"]
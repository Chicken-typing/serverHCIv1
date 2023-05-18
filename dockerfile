FROM node:18.14.2

WORKDIR /app

COPY . .

RUN yarn install --network-timeout 1000000

CMD ["yarn", "start"]
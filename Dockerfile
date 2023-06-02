FROM node:18.16.0 as builder

RUN ["apt-get", "update"]
RUN ["apt-get", "install", "-y", "vim"]

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

FROM node:18-slim

WORKDIR /app

COPY --from=builder /app /app

CMD ["npm", "run", "start"]

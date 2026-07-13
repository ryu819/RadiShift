FROM node:22.21.1-slim

ENV TZ=Asia/Tokyo

WORKDIR /frontend

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
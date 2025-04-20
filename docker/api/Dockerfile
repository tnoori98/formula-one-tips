FROM node:22

WORKDIR /api

COPY backend .

RUN npm install
RUN npm run build

CMD  ["npm", "run", "start"]
FROM zenika/alpine-chrome:with-puppeteer

ARG NODE_ENV=production

USER root
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set unsafe-perm true

RUN npm i --production

COPY . .

CMD [ "npm", "start" ]

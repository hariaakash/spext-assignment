FROM node:16.15.1-alpine3.16

# copy ffmpeg bins from mwader/static-ffmpeg
COPY --from=mwader/static-ffmpeg:5.0.1-3 /ffmpeg /usr/local/bin/
COPY --from=mwader/static-ffmpeg:5.0.1-3 /ffprobe /usr/local/bin/

ARG NODE_ENV=production

USER root
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm config set unsafe-perm true

RUN npm i --production

COPY . .

CMD [ "npm", "start" ]

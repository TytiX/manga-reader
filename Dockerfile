FROM node:12-alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
# RUN yarn install NOT WORKING ON CI...
RUN npm install
RUN yarn build

FROM node:12-alpine
WORKDIR /app
RUN apk update && apk add --no-cache nmap && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache \
      chromium \
      harfbuzz \
      "freetype>2.8" \
      ttf-freefont \
      nss
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# RUN apk add --update-cache \
#     python \
#     python-dev \
#     py-pip \
#     build-base
# RUN apk update && apk add dcron && rm -rf /var/cache/apk/*
# RUN mkdir -p /var/log/cron && mkdir -m 0644 -p /var/spool/cron/crontabs && touch /var/log/cron/cron.log && mkdir -m 0644 -p /etc/cron.d
COPY ./node-server .
# RUN yarn install NOT WORKING ON CI...
RUN npm install
COPY --from=vue-builder /app/dist ./public

EXPOSE 3000
ENTRYPOINT [ "yarn", "start" ]

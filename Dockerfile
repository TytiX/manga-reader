FROM node:12-alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
RUN npm install
RUN yarn build

FROM node:12-alpine
WORKDIR /app
# RUN apk add --update-cache \
#     python \
#     python-dev \
#     py-pip \
#     build-base
RUN apk update && apk add dcron && rm -rf /var/cache/apk/*
RUN mkdir -p /var/log/cron && mkdir -m 0644 -p /var/spool/cron/crontabs && touch /var/log/cron/cron.log && mkdir -m 0644 -p /etc/cron.d
COPY ./node-server .
RUN npm install
COPY --from=vue-builder /app/dist ./public
CMD [ "yarn", "start" ]

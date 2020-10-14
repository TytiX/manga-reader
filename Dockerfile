FROM node:10-alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
RUN yarn cache clean
RUN yarn install --cache-folder /tmp/.junk
RUN yarn build

FROM node:14-alpine
WORKDIR /app
# RUN apk add --update-cache \
#     python \
#     python-dev \
#     py-pip \
#     build-base
COPY ./node-server .
RUN yarn install --cache-folder /tmp/.junk
COPY --from=vue-builder /app/dist ./public
CMD [ "yarn", "start" ]

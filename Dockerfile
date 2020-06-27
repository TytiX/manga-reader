FROM node:alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
RUN yarn install
RUN yarn build

FROM node:alpine
WORKDIR /app
# RUN apk add --update-cache \
#     python \
#     python-dev \
#     py-pip \
#     build-base
COPY ./node-server .
RUN yarn install
COPY --from=vue-builder /app/dist ./public
CMD [ "yarn", "start" ]

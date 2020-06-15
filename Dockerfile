FROM node:alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
RUN yarn install
RUN yarn build

FROM node:alpine
WORKDIR /app
COPY ./node-server .
COPY --from=vue-builder /app/build ./public
CMD [ "yarn", "start" ]

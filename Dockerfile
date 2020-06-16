FROM node:alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
RUN yarn install
RUN yarn build

FROM node:alpine
WORKDIR /app
RUN apt-get update || : && apt-get install python -y
COPY ./node-server .
RUN yarn install
COPY --from=vue-builder /app/dist ./public
CMD [ "yarn", "start" ]

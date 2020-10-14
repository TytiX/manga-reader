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
COPY ./node-server .
RUN npm install
COPY --from=vue-builder /app/dist ./public
CMD [ "yarn", "start" ]

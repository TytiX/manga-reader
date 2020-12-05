FROM node:12-alpine AS vue-builder
WORKDIR /app
COPY ./vue-reader .
# RUN yarn install NOT WORKING ON CI...
RUN npm install
RUN yarn build

FROM node:12-alpine
WORKDIR /app
# peppeter install chrome
# Installs latest Chromium (85) package.
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont
# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
# Copy application
COPY ./node-server .
# Add user so we don't need --no-sandbox.
RUN addgroup -S pptruser && adduser -S -g pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app
# change user
USER pptruser
# RUN yarn install NOT WORKING ON CI...
RUN npm install
COPY --from=vue-builder /app/dist ./public

EXPOSE 3000
ENTRYPOINT [ "yarn", "start" ]

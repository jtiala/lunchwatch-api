FROM node:9.4-alpine

# Install bash and yarn
RUN apk update && apk add bash yarn && rm -rf /var/cache/apk/*

# Copy app and install packages
WORKDIR /app
COPY . .
RUN yarn

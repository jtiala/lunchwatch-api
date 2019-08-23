FROM node:12-alpine

# Copy source
WORKDIR /api
COPY . .

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 8080
EXPOSE 9229

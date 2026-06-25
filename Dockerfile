FROM node:24-alpine3.22 AS builder
ADD . /app
RUN apk add bash
RUN apk add --no-cache \
        python3 \
        py3-pip \
    && rm -rf /var/cache/apk/*
RUN apk add --update alpine-sdk
WORKDIR /app
COPY package*.json /app/
RUN npm install -g typescript
COPY src ./src
COPY tsconfig.json ./
RUN npm install
RUN npm run build

# RUN npm run build

FROM node:24-alpine3.22

RUN apk update && apk upgrade --no-cache

RUN apk add --no-cache \
        bash \
        dos2unix \
        python3 \
        py3-pip \
        alpine-sdk \
        aws-cli \
    && rm -rf /var/cache/apk/*

ADD . /app
WORKDIR /app

COPY package*.json /app/
RUN npm install pm2 -g
RUN npm install --omit=dev
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder ./app/dist/ .

RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh
ENTRYPOINT ["/bin/bash", "-c", "/app/entrypoint.sh"]

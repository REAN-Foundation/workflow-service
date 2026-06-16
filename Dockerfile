FROM node:24-alpine3.22 AS builder

# Layer 1: system deps (cached unless Alpine changes)
RUN apk add --no-cache bash python3 py3-pip alpine-sdk

WORKDIR /app

# Layer 2: npm dependencies (cached unless package.json changes)
COPY package*.json ./
RUN npm install -g typescript
RUN npm install

# Layer 3: source code + required JSON files for tsc
COPY src ./src
COPY tsconfig.json ./
COPY service.config.json ./
COPY service.config.local.json ./
COPY seed.data ./seed.data
RUN npm run build

FROM node:24-alpine3.22

# Layer 1: system deps (cached)
RUN apk add --no-cache bash python3 py3-pip aws-cli

WORKDIR /app

# Layer 2: npm dependencies (cached unless package.json changes)
COPY package*.json ./
RUN npm install pm2 -g
RUN npm install

# Layer 3: runtime files from repository
COPY . /app/

# Layer 4: built output from builder (preserve original runtime layout)
COPY --from=builder /app/dist/ .

# Ensure entrypoint permissions in final image
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/bash", "-c", "/app/entrypoint.sh"]

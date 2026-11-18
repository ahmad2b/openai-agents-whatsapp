FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json index.ts ./
COPY agent ./agent
COPY whatsapp ./whatsapp
COPY local ./local
RUN npm run check
USER node
CMD ["./node_modules/.bin/tsx", "index.ts"]

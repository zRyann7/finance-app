FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app

# Só as dependências de produção, exatamente como no package-lock.json.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Não rodar como root.
USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/app.js"]

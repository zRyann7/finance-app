# ETAPA 1: Build
FROM node:22-alpine AS build
WORKDIR /app

# A URL da API é lida pelo Vite em tempo de BUILD e fica dentro do bundle.
# Para outro ambiente: docker build --build-arg VITE_API_URL=https://seu-dominio -t frontend .
# (endereço da API sem o sufixo /api; com ele também funciona)
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
# Supabase (público) só para o upload de avatar. Também alimenta a CSP gerada no build.
ARG VITE_SUPABASE_URL=
ARG VITE_SUPABASE_ANON_KEY=
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# 1) Build do Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
# Opcional: só se o front for chamar a Lambda direto, sem o proxy do nginx.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 2) nginx servindo o build e repassando /api para a Lambda
FROM nginx:1.27-alpine
# A imagem oficial roda envsubst nos *.template ao iniciar, trocando apenas
# variáveis de ambiente definidas (${LAMBDA_HOST}, ${NGINX_RESOLVER}).
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV NGINX_RESOLVER=127.0.0.11
EXPOSE 80

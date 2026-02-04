FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json ./

RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npm run build


FROM nginx:alpine

RUN printf 'server {\n\
    listen 80;\n\
    location / {\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/opal-project/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
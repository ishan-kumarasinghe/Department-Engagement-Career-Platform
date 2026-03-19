# Build stage for Vite/React
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage using Nginx
FROM nginx:alpine
# Copy built assets to Nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html
# Add custom Nginx configuration for single-page application routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

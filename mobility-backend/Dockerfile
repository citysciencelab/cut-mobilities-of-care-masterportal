# Create container for running mobility-backend
FROM node:12-alpine

RUN mkdir -p /usr/app/mobility-backend/dist
WORKDIR /usr/app/mobility-backend

# Copy mobility-backend sources
COPY mobility-backend/package.json mobility-backend/tsconfig.json ./
COPY mobility-backend/src ./src
COPY shared ../shared

# Install and run mobility-backend
RUN npm install

EXPOSE 8080
CMD npm start

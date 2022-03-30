# Create container for building mobility-backend
FROM node:12-alpine as build-backend

RUN mkdir -p /usr/app/mobility-backend/dist
WORKDIR /usr/app/mobility-backend

# Copy mobility-backend sources
COPY /mobility-backend/package.json  ./
COPY /mobility-backend/tsconfig.json  ./
COPY /mobility-backend/src ./src
COPY /shared ../shared

# Install and run mobility-backend
RUN npm install

EXPOSE 8080
CMD npm start


# Create container for building mobility-frontend
FROM node:12-alpine as build

RUN mkdir -p /usr/app
WORKDIR /usr/app

ARG API_BASE_URL
ENV API_BASE=$API_BASE_URL

ARG TEST_ENV
ENV TEST_ENV=$TEST_ENV

RUN apk add --no-cache git
RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

COPY . ./masterportal

# Set config for MobilityDraw addon
RUN touch ./masterportal/addons/mobilityDataDraw/config.json
RUN cat > ./masterportal/addons/mobilityDataDraw/config.json
RUN echo '{"API_BASE_URL" : "'$API_BASE'", "TEST_ENV" : "'$TEST_ENV'"}' >> ./masterportal/addons/mobilityDataDraw/config.json

RUN npm i --prefix masterportal/addons/mobilityDataDraw
RUN npm i --prefix masterportal/addons/storyTellingTool
RUN npm i --prefix masterportal

RUN npm run buildPortal --prefix masterportal

# Create container for running mobility-frontend
FROM nginx

# Copy build files from build container
COPY --from=build /usr/app/masterportal/dist /usr/share/nginx/html

EXPOSE 80

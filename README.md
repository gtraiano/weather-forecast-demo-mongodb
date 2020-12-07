# demo-weather-forecast

> Demo weather forecast website

## Description

Demonstration of the Weather Forecast Application.
Frontend written in Vue.js, backend in Node + Express.
Application utilizes
 - Nominatim and Openstreetmap API for location data
 - OpenWeather API for forecast data
 - Vue Leaflet to render the map
 - vue-chartjs to render plots

## Build Setup

### Backend
Make sure MongoDB is running before starting the backend

``` bash
# install dependencies
npm install

# run backend
npm start

# run backend for development
npm run dev
```

### Frontend
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## Environment
Make sure you have passed the correct values for the following variables

### Backend
```
BACKEND_API_URL=backend path (e.g. /)
OW_USER_TOKEN=OpenWeather user token
EXPRESS_SERVER_PORT=Express server port
MONGODB_PORT=MongoDB server port

# HTTPS certificate
PRIVATE_KEY=private key file path
CERTIFICATE=certificate file path
```

### Frontend
```
BACKEND_PORT=backend port
BACKEND_DOMAIN=backend domain
BACKEND_PATH=backend root path
```

## License - Proprietary
Copyright - Spiros Dimopoulos <sdimopoulos@irisweb.gr>
Modification and additions - Georgios Traianos <gtraiano@gmail.com>
It is provided as is without any guarantee for demonstration purposes solely.
Not to be redistributed in any form, copied or sold.

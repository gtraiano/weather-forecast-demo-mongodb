# weather-forecast-demo
> Demo weather forecast website

## Information
Frontend written in Vue.js, backend in Node + Express.

The application utilizes
 - Nominatim and Openstreetmap API for location data
 - OpenWeather API for forecast data
 - Vue Leaflet to render the map
 - vue-chartjs to render plots
 - MongoDB for persistent storage

You can try a [live demo](https://weather-forecast-backend.herokuapp.com/), provided that you have an OpenWeather API key ([details](https://openweathermap.org/price)).

Note: The API key you provided will be removed from the backend when you close the browser tab/window. The application does not support user sessions, all API requests use the same key.

## Scripts

### Backend
Make sure a MongoDB service is available before starting the backend

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
The build will be found under `./frontend/dist/`.

## Environment variables
A single .env file must reside at the project's root folder. A sample .env file is provided in `.env.sample`.

### Backend server configuration
| | |
|---|---|
|`BACKEND_SERVER_PROTOCOLS`|Comma separated list including HTTP and/or HTTPS protocols. If HTTPS is included, the frontend will prefer it over HTTP.|
|`BACKEND_SERVER_HTTP_PORT`|HTTP server listening port|
|`BACKEND_SERVER_HTTPS_PORT`|HTTPS server listening port|

### Backend server SSL credentials
| | |
|---|---|
|`BACKEND_SERVER_PRIVATE_KEY`|SSL private key file absolute path|
|`BACKEND_SERVER_CERTIFICATE`|SSL public key file absolute path|
|`BACKEND_SERVER_CA`|SSL certification authority (optional)|

### Backend API configuration
| | |
|---|---|
|`MONGODB_URI`|MongoDB URI string|
|`BACKEND_API_ENDPOINT`|Backend endpoint|
|`OW_API_KEY`|OpenWeather API key|
|`DISABLE_REFETCH`|Disables fetching of forecast data from OpenWeather API|

### Webpack Dev Server configuration
| | |
|-|-
|`WEBPACK_DEV_SERVER_HTTPS`|Set to 1 to run development server with HTTPS protocol|

#### SSL credentials
If not provided, Webpack Dev Server will generate its own.
| | |
|-|-
|`WEBPACK_DEV_SERVER_PRIVATE_KEY`|SSL private key absolute path|
|`WEBPACK_DEV_SERVER_CERTIFICATE`|SSL public key absolute path|
|`WEBPACK_DEV_SERVER_CA`|SSL certification authority (optional)|


## License - Proprietary
Copyright - Spiros Dimopoulos <sdimopoulos@irisweb.gr>

Modification and additions - Georgios Traianos <gtraiano@gmail.com>

It is provided as is without any guarantee for demonstration purposes solely.

Not to be redistributed in any form, copied or sold.
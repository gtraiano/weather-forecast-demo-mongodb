import express, { response } from 'express';
import request from 'supertest';
import config from '../../config/index.js';
//import routes from '../../routes/routes.js';
import openWeatherRouter from '../../routes/openweather.js';

/*const url = {
    ...config.server.BACKEND_SERVER_PROTOCOLS.includes('https') && {
        https: `https://${config.server.BACKEND_DOMAIN}${config.server.BACKEND_SERVER_HTTPS_PORT ? ':' + config.server.BACKEND_SERVER_HTTPS_PORT : ''}`
    },
    ...config.server.BACKEND_SERVER_PROTOCOLS.includes('http') && {
        http: `http://${config.server.BACKEND_DOMAIN}${config.server.BACKEND_SERVER_HTTP_PORT ? ':' + config.server.BACKEND_SERVER_HTTP_PORT : ''}`
    }
};*/

const app = express();
app.use(openWeatherRouter);
const api = request(app);

const city = {
    lat: 40.6403167,
    lon: 22.9352716
};

describe(`/openweather`, () => {
    test('GET /lat/lon', async () => {
        const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}openweather/${city.lat}/${city.lon}`);
        expect(response).toBeDefined()
        expect(response.error).not.toBeDefined();
        
        expect(response.lat).toEqual(city.lat);
        expect(response.lon).toEqual(city.lon);
        
        expect(response.timezone).toBeDefined();
        
        expect(response.current).toBeDefined();
        expect(response.current instanceof Object).toBeTruthy();

        expect(response.hourly).toBeDefined();
        expect(response.hourly instanceof Array).toBeTruthy();
        expect(response.hourly.every(h => h instanceof Object)).toBeTruthy();
    });

    test('GET /lat/lon returns error codes', async () => {
        const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}openweather/${city.lat}/${city.lon}`);
        //console.log(response);
        expect(response).toBeDefined();
        expect(response.error).toBeDefined();
        expect(response.body.error).toBeDefined();
    });
});
import express, { json } from 'express';
import request from 'supertest';
import config from '../../config';
//import routes from '../../routes/routes';
import apiKeyRouter from '../../routes/apikey';

const app = express();
app.use(json());
app.use(apiKeyRouter);
const api = request(app);

describe('/apikey', () => {
    describe('Using permanent OpenWeather API key', () => {
        test('GET returns 200', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(200);
            expect(response.text).toEqual('');
        });
    });

    describe('Switch from using permanent to temporary OpenWeather API key', () => {
        beforeAll(async () => {
            await api.put(`${config.api.BACKEND_API_ENDPOINT}apikey/allowtemp`);
        });
        test('GET returns 204', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });
    });
    
    describe('Using temporary OpenWeather API key in not set', () => {
        test('GET with no key set for ip address returns 204', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });

        test('POST key returns 201 and key as text', async () => {
            const tempKey = { apiKey: 'myAPIKey' };
            const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).send(tempKey);
            expect(response.status).toEqual(201);
            expect(response.text).toEqual(tempKey.apiKey);
        });

        test('POST null key returns 204 and no text', async () => {
            const tempKey = { apiKey: null };
            const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).send(tempKey);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });

        test('POST with empty body returns 400', async () => {
            const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).send();
            expect(response.status).toEqual(400);
        });

        test('GET with no key set for ip address returns 204 and no text', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });
    });
});
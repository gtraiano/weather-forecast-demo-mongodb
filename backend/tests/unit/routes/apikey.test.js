import express, { json } from 'express';
import request from 'supertest';
import config from '../../../config';
import apiKeyRouter from '../../../routes/apikey';

const app = express();
app.use(json());
app.use(apiKeyRouter);
const api = request(app);

describe('/apikey', () => {
    describe('Using permanent OpenWeather API key', () => {
        test('GET responds with 200', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(200);
            expect(response.text).toEqual('');
        });
    });

    describe('Switch from using permanent to temporary OpenWeather API key', () => {
        beforeAll(async () => {
            await api.put(`${config.api.BACKEND_API_ENDPOINT}apikey/allowtemp`);
        });
        test('GET responds with 204 when no temporary key is set for request IP address', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });
    });
    
    describe('Using temporary OpenWeather API key', () => {
        beforeAll(async () => {
            await api.put(`${config.api.BACKEND_API_ENDPOINT}apikey/allowtemp`);
        });

        test('GET responds with 204 and empty body when no key is set for request IP address', async () => {
            const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
            expect(response.status).toEqual(204);
            expect(response.text).toEqual('');
        });

        describe('body data in text format', () => {
            test('POST key in JSON format responds with 201 and key value as text', async () => {
                const tempKey = { key: 'myAPIKey' };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'text/plain').send(JSON.stringify(tempKey));
                expect(response.status).toEqual(201);
                expect(response.text).toEqual(tempKey.key);
            });

            test('GET responds with 200 and temporary key as text when a key for request IP address is in use', async () => {
                const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
                expect(response.status).toEqual(200);
                expect(response.text).toEqual('myAPIKey');
            });

            test('POST responds with 204 when body contains null key in JSON format', async () => {
                const tempKey = { key: null };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'text/plain').send(JSON.stringify(tempKey));
                expect(response.status).toEqual(204);
            });

            test('POST responds with 400 when body contains undefined key in JSON format ', async () => {
                const tempKey = { key: undefined };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'text/plain').send(JSON.stringify(tempKey));
                expect(response.status).toEqual(400);
                expect(response.body.error).toMatch(/empty/i);
            });
    
            test('POST responds with 400 when body contains key in invalid JSON format', async () => {
                const tempKey = "{key:'myAPIKey'}";
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'text/plain').send(tempKey);
                expect(response.status).toEqual(400);
            });
        });

        describe('body data as JSON', () => {
            test('POST key responds with 201 and key as text', async () => {
                const tempKey = { key: 'myAPIKey' };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'application/json').send(tempKey);
                expect(response.status).toEqual(201);
                expect(response.text).toEqual(tempKey.key);
            });

            test('GET responds with 200 and key as text when temporary key for request IP address is in use', async () => {
                const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}apikey`);
                expect(response.status).toEqual(200);
                expect(response.text).toEqual('myAPIKey');
            });
    
            test('POST responds with 204 and no text when body contains null key', async () => {
                const tempKey = { key: null };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'application/json').send(tempKey);
                expect(response.status).toEqual(204);
                expect(response.text).toEqual('');
            });

            test('POST responds with 400 and no text when body contains undefined key', async () => {
                const tempKey = { key: undefined };
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'application/json').send(tempKey);
                expect(response.status).toEqual(400);
                expect(response.body.error).toMatch(/empty/i);
            });
    
            test('POST responds with 400 when body is empty', async () => {
                const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).set('Content-Type', 'application/json').send();
                expect(response.status).toEqual(400);
            });
        });
    });
});
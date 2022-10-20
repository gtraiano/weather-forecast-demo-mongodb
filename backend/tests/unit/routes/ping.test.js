import express from 'express';
import request from 'supertest';
import config from '../../../config';
import pingRouter from '../../../routes/ping';

const app = express();
app.use(pingRouter);
const api = request(app);

describe('/ping', () => {
    test('GET returns 200 and "pong" as text', async () => {
        const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}ping`);
        expect(response.status).toBe(200);
        expect(response.type).toMatch(/text\/plain/);
        expect(response.text).toEqual('pong');
    });
});
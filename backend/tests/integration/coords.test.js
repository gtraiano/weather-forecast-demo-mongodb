import express, { json } from 'express';
import request from 'supertest';
//import config from '../../config/index.js';
//import routes from '../../routes/routes.js';
import coordsRouter from '../../routes/coords.js';

const app = express();
//app.use(routes);
app.use(json());
//app.use(routes);
app.use(coordsRouter);
const api = request(app);

const city = {
    lat: 40.6403167,
    lon: 22.9352716
};

describe('/coords', () => {
    // connect to db
    beforeAll(async () => {
        await api.post(`/coords/start`);
        //await api.post(`/coords`).send(city);
    }, 60000);

    // disconnect from db
    afterAll(async () => {
        await api.post('/coords/clear');
        await api.post(`/coords/stop`);
    }, 60000);

    describe('POST', () => {
        test('/ returns 201', async () => {
            const response = await api.post('/coords').send(city);
            expect(response.status).toBe(201);
        })
    })

    /*describe('GET', () => {
        test('/ returns 200 and array as json', async () => {
            const response = await api.get(`/coords`);
            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body instanceof Array).toBeTruthy();
        });

        test('/lat/lon returns 200 and object as json', async () => {
            const response = await api.get(`/coords/${city.lat}/${city.lon}`);
            expect(response.status).toBe(200);
            expect(response.type).toMatch(/json/);
            expect(response.body instanceof Object).toBeTruthy();
        });

        test('/lat/lon does not return _id field', async () => {
            const response = await api.get(`/coords/${city.lat}/${city.lon}`);
            expect(response._id).not.toBeDefined();
        });

        test('/lat/lon for non-existing location returns 404 and error message as json', async () => {
            const response = await api.get(`/coords/0/0`);
            expect(response.status).toBe(404);
            expect(response.type).toMatch(/json/);
            expect(response.body).toBeDefined();
            expect(response.body.error).toBeDefined();
            expect(response.body.error.length).toBeTruthy();
        });
    });*/
});
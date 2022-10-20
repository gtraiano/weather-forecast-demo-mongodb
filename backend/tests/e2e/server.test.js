import request from 'supertest';
import config from '../../config/index.js';
import server from '../../server.js';

const url = {
    ...config.server.BACKEND_SERVER_PROTOCOLS.includes('https') && {
        https: `https://${config.server.BACKEND_DOMAIN}${config.server.BACKEND_SERVER_HTTPS_PORT ? ':' + config.server.BACKEND_SERVER_HTTPS_PORT : ''}`
    },
    ...config.server.BACKEND_SERVER_PROTOCOLS.includes('http') && {
        http: `http://${config.server.BACKEND_DOMAIN}${config.server.BACKEND_SERVER_HTTP_PORT ? ':' + config.server.BACKEND_SERVER_HTTP_PORT : ''}`
    }
};

const api = Object.entries(url).reduce((apis, [protocol, url]) => ({ ...apis, [protocol]: request(url) }), {});

const city = {
    lat: 40.6403167,
    lon: 22.9352716
};

Object.entries(api).forEach(([protocol, api]) => {
    describe(`${protocol.toUpperCase()}`, () => {
        beforeAll(async () => {
            await server.start();
            await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey/reset`);
        }, 60000);
        
        afterAll(async () => {
            await server.exit();
        }, 60000);

        describe('/ping', () => {
            test('GET', async () => {
                const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}ping`);
                expect(response.status).toBe(200);
                expect(response.text).toEqual('pong');
            });
        });

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
                    const tempKey = { key: 'myAPIKey' };
                    const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}apikey`).send(tempKey);
                    expect(response.status).toEqual(201);
                    expect(response.text).toEqual(tempKey.key);
                });
        
                test('POST null key returns 204 and no text', async () => {
                    const tempKey = { key: null };
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
        
        describe(`/openweather`, () => {
            test('GET /lat/lon', async () => {
                const response = await api.get(`${config.api.BACKEND_API_ENDPOINT}openweather/${city.lat}/${city.lon}`);
                expect(response).toBeDefined()
                expect(response.type).toMatch(/json/);
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
                expect(response).toBeDefined();
                expect(response.type).toMatch(/json/);
                expect(response.error).toBeDefined();
                expect(response.body.error).toBeDefined();
            });
        });
        
        describe('/coords', () => {
            // connect to db
            beforeAll(async () => {
                await api.post(`/coords/start`);
                await api.post('/coords/clear');
            }, 60000);
        
            // disconnect from db
            afterAll(async () => {
                await api.post('/coords/clear');
                await api.post(`/coords/stop`);
            }, 60000);
        
            describe('POST', () => {
                test('/ returns 201 and new document', async () => {
                    const response = await api.post(`${config.api.BACKEND_API_ENDPOINT}coords`).set('Content-Type', 'application/json').send(city);
                    expect(response.status).toBe(201);
                    expect(response.body).toEqual(city);
                });
            })
        
            describe('GET', () => {
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
            });
        });
    });
});
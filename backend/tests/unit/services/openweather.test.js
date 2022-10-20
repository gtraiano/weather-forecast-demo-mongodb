import OWService from '../../../services/OpenWeather/OpenWeatherOneCall.js';
import config from '../../../config/index.js';

const apiKey = config.openWeather.OW_API_KEY;
const lat = 40.6403167, lon = 22.9352716;

describe('OpenWeather One Call', () => {
    describe('fetchCity', () => {
        if(!apiKey) throw new Error('OpenWeather API key is not set');
        let response;
        beforeAll(async () => {
            response = await OWService.fetchCity(lat, lon, apiKey);
        })

        test('response is an object', () => {
            expect(response).not.toBeNull();
            expect(response).toBeDefined();
            expect(response instanceof Object).toBe(true);
        });
    
        test('response is valid JSON object', () => {
            expect(() => { JSON.stringify(response) }).not.toThrow();
        });
    
        test('response contains result for given query', () => {
            expect(response.lat === lat).toBe(true);
            expect(response.lon === lon).toBe(true);
        });
    });
});
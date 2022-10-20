import { searchCity, searchLatLon } from '../../../services/Nominatim/index.js';

describe('Nominatim service', () => {
    describe('/search', () => {
        let response = {
            en: null,
            el: null
        };
        
        beforeAll(async () => {
            response.en = await searchCity('Thessaloniki', 'en');
            response.el = await searchCity('Thessaloniki', 'el');
        });
        
        test('response is an array', () => {
            expect(response.en).not.toBeNull();
            expect(response.en).toBeDefined();
            expect(response.en instanceof Array).toBe(true);
        });

        test('response array elements are valid JSON objects', () => {
            expect(response.en.every(c => typeof c === 'object')).toBe(true);
            expect(() => {
                response.en.forEach(c => JSON.stringify(c));
            }).not.toThrow();
        });

        test('response array contains results for given query', () => {
            const regex = /thessaloniki/i
            expect(response.en.every(cur => regex.test(cur.display_name))).toBe(true);
        });

        test('response respects `locale` argument', () => {
            const regexEN = /thessaloniki/i
            expect(response.en.every(cur => regexEN.test(cur.display_name))).toBe(true);

            const regexEL = /θεσσαλονίκη/i
            expect(response.el.every(cur => regexEL.test(cur.display_name))).toBe(true);
        });
    });

    describe('/reverse', () => {
        const lat = 40.6403167, lon = 22.9352716,
            name = {
                en: "thessaloniki",
                el: "θεσσαλονίκη"
            };

        const response = {
            en: null,
            el: null
        };
        
        beforeAll(async () => {
            response.en = await searchLatLon(lat, lon, 'en');
            response.el = await searchLatLon(lat, lon, 'el');
        });

        test('response is an object', () => {
            expect(response.en).not.toBeNull();
            expect(response.en).toBeDefined();
            expect(response.en instanceof Object).toBe(true);
        });

        test('response array elements are valid JSON objects', () => {
            expect(() => {
                JSON.stringify(response.en)
            }).not.toThrow();
        });

        test('response object contains result for given query', () => {
            const regex = new RegExp(name.en, 'i');
            expect(regex.test(response.en.display_name)).toBe(true);
        });

        test('response respects `locale` argument', () => {
            const regexEN = new RegExp(name.en, 'i');
            expect(regexEN.test(response.en.display_name)).toBe(true);

            const regexEL = new RegExp(name.el, 'i');
            expect(regexEL.test(response.el.display_name)).toBe(true);
        });
    });
});
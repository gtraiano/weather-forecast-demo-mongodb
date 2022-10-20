import forecastDatabase from "../../../services/ForecastDatabase/forecastDatabase";

describe('forecast database', () => {
    const mockCity = {
        lat: 1,
        lon: 1,
        data: 'test data'
    };
    
    beforeAll(async () => {
        await forecastDatabase.connect();
        await forecastDatabase.clearDatabase();
    }, 60000);

    afterAll(async () => {
        await forecastDatabase.clearDatabase();
        await forecastDatabase.close();
    }, 60000);

    describe('insert city', () => {
        test('non-existing city', async () => {
            const inserted = await forecastDatabase.insertCity(mockCity);
            const found = await forecastDatabase.findCity(mockCity.lat, mockCity.lon);
            expect(inserted.upsertedCount).toEqual(1);
            expect(inserted.upsertedId).toEqual(found._id);
            expect(found).toEqual(
                expect.objectContaining(mockCity)
            );
        });

        test('existing city (upsert) throws error', async () => {
            let caught = false;
            try {
                await forecastDatabase.insertCity(mockCity);
            }
            catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });
    })

    describe('find city', () => {
        test('existing city', async () => {
            const found = await forecastDatabase.findCity(mockCity.lat, mockCity.lon);
            expect(found).toEqual(
                expect.objectContaining(mockCity)
            );
        });
    
        test('non-existing city throws error', async () => {
            let caught = false;
            try {
                await forecastDatabase.findCity(10, 10)
            }
            catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });
    });

    describe('update city', () => {
        test('existing city', async () => {
            const data = 'test data updated'
            
            const updated = await forecastDatabase.updateCity(mockCity.lat, mockCity.lon, { data });
            expect(updated.data).toEqual(data);
        });

        test('non-existing city throw error', async () => {
            let caught = false;
            try {
                const data = 'test data updated'
                const updated = await forecastDatabase.updateCity(10, 10, { data });
                expect(updated.data).toEqual(data);
            }
            catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        });
    });
    
    describe('remove city', () => {
        test('existing city', async () => {
            let caught = false;
            try {
                await forecastDatabase.removeCity(mockCity.lat, mockCity.lon);
            }
            catch(e) {
                caught = true;
            }
            expect(caught).toBeFalsy();
        });

        test('non-existing city throws error', async () => {
            let caught = false;
            try {
                await forecastDatabase.removeCity(10, 10);
            }
            catch(e) {
                caught = true;
            }
            expect(caught).toBeTruthy();
        })
    });

    describe('batch insert cities', () => {
        test('non-existing cities', async () => {
            await forecastDatabase.clearDatabase();
            const batch = new Array(4).map((_e, i) => ({
                lat: i,
                lon: i,
                data: `city data ${i}`
            }));
            const inserted = await forecastDatabase.insertCities(batch);
            batch.forEach(({ lat, lon, data }, i) => {
                expect(lat).toEqual(inserted[i].lat);
                expect(lon).toEqual(inserted[i].lon);
                expect(data).toEqual(inserted[i].data);
            });
        });

        test('include existing cities returns error', async () => {
            // clear db and insert city
            await forecastDatabase.clearDatabase();            
            await forecastDatabase.insertCity(mockCity);

            // prepare batch and insert into db
            const batch = new Array(4).map((_e, i) => ({
                lat: i,
                lon: i,
                data: `city data ${i}`
            }));
            const inserted = await forecastDatabase.insertCities(batch);

            // check inserts
            batch.forEach(({ lat, lon, data }, i) => {
                // non-existing
                if(lat !== mockCity.lat && lon !== mockCity.lon) {
                    expect(lat).toEqual(inserted[i].lat);
                    expect(lon).toEqual(inserted[i].lon);
                    expect(data).toEqual(inserted[i].data);
                }
                // existing
                else {
                    expect(inserted[i] instanceof Error).toBeTruthy();
                }
            });
        });
    });
})
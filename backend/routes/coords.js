import { Router } from 'express';
import forecastDb from '../services/ForecastDatabase/forecastDatabase.js';
import owService from '../services/OpenWeather/OpenWeatherOneCall.js';
import { HEADERS } from './headers/index.js';
import { TEMP_API_KEY } from '../middleware/useTemporaryAPIKey/index.js';
import { removeId } from '../middleware/dbTransformData/index.js';

const coordsRouter = Router();

// middleware
coordsRouter.use(removeId);

const refetchForecastData = async (lat, lon, tempKey) => {
/* refetches fresh data from OpenWeather fot city document */
    const forecastData = await owService.fetchCity(lat, lon, tempKey);
    // get rid of coords from OpenWeather data
    delete forecastData.lat;
    delete forecastData.lon;

    return {
        lat: Number.parseFloat(lat),
        lon: Number.parseFloat(lon),
        ...forecastData
    };
}

coordsRouter.get('/coords', async (_req, res, _next) => {
/* get all cities from database */
    let results = await forecastDb.allCities();
    res.json(results);
});
    
coordsRouter.get('/coords/refetch', async (req, res, _next) => {
/* get all cities from database and refreshes their forecast data */
    let results = await forecastDb.allCities();
    
    results = await Promise.all(
        results.map( async city => {
            try {
                const updated = await refetchForecastData(city.lat, city.lon, req[TEMP_API_KEY]);
                // add updated property to declare if forecast data updated or not
                return { updated: true, ...city, ...updated }
            }
            catch(error) {
                return { updated: false, ...city };
            }
        })
    );
    await forecastDb.updateCities(results.filter(city => city.updated == true ));

    res.json(results.map(city => {
        delete city.updated;
        return city;
    }));
});

coordsRouter.get('/coords/:lat/:lon', async (req, res, next) => {
/* get city by lat & lon */
    try {
        let cityData = await forecastDb.findCity(req.params.lat, req.params.lon);
        res.json(cityData);
    }
    catch(error) {
        //res.status(404).end();
        res.status(404).json({ error: error.message });
        next(error.message);
    }
});

coordsRouter.get('/coords/:lat/:lon/refetch', async (req, res, next) => {
/* get city by lat & lon */
    try {
        let forecastData = null;
        let cityData = await forecastDb.findCity(req.params.lat, req.params.lon);

        const updated = await refetchForecastData(req.params.lat, req.params.lon, req[TEMP_API_KEY]);
        forecastData = await forecastDb.updateCity(req.params.lat, req.params.lon, { ...cityData, ...updated });
        res.json(forecastData);
    }
    catch(error) {
        if(error.isAxiosError) {
            // OpenWeather api has returned error
            res.status(error.response.status).json({ error: error.response.data.message ?? error.message });
        }
        else {
            res.status(404).json({ error: error.message });
        }
        next(error.message);
    }
});

coordsRouter.put('/coords/:lat/:lon', async (req, res, next) => {
/* modify city data with data contained in request body */
    try {
        const body = req.body;
        if (Object.keys(body).length === 0 && body.constructor === Object) { // empty object
            res.status(400).end();

        }
        const result = await forecastDb.updateCity(req.params.lat, req.params.lon, body);
        /*if(result) res.json(200).end();
        else res.status(404).end();*/
        res.status(200).json(result);
    }
    catch(error){
        res.status(404).end()
        next(error.message);
    }
});

coordsRouter.post('/coords', async (req, res, next) => {
/* add city with data in request body */
    try {
        const body = req.body;
        if (Object.keys(body).length === 0 && body.constructor === Object) { // empty object
            res.status(400).end();

        }
        const result = await forecastDb.insertCity(body);
        res.status(201).json(body);
    }
    catch(error) {
        res.status(404).end();
        next(error.message);
    }
});

coordsRouter.post('/coords/:lat/:lon', async (req, res, next) => {
/* add city with coordinates (no data in body required) */
    try {
        if(typeof req.get(HEADERS.locales) === 'undefined') {
            res.status(400).end();
            return;
        }

        const locales = req.get(HEADERS.locales).split(',');
        const locationData = Object.assign(
            {},
            ...await Promise.all( locales.map(async locale => ({ [locale]: await searchLatLon(req.params.lat, req.params.lon, locale) }) ) )
        );

        forecastData = await owService.fetchCity(req.params.lat, req.params.lon, req[TEMP_API_KEY]);

        // we want keep coords from location data only
        delete forecastData.lat;
        delete forecastData.lon;

        const toInsert = {
            location: locationData,
            lat: Number.parseFloat(req.params.lat),
            lon: Number.parseFloat(req.params.lon),
            ...forecastData
        };
        
        const result = await forecastDb.insertCity(toInsert);
        res.status(201).json(toInsert);
    }
    catch(error) {
        res.status(404).end();
        next(error.message);
    }
});

coordsRouter.delete('/coords/:lat/:lon', async (req, res, next) => {
    try {
        await forecastDb.removeCity(req.params.lat, req.params.lon);
        res.status(200).end();
    }
    catch(error) {
        res.status(404).end();
        next(error.message);
    }
});

// used in testing for connecting, disconnecting and clearing database
if(process.env.NODE_ENV === 'test') {
    coordsRouter.post('/coords/start', async (req, res) => {
        try {
            await forecastDb.connect();
            res.status(200).end();
        }
        catch(error) {
            res.status(500).end();
        }
    });

    coordsRouter.post('/coords/stop', async (req, res) => {
        try {
            await forecastDb.close();
            res.status(200).end();
        }
        catch(error) {
            res.status(500).end();
        }
    });

    coordsRouter.post('/coords/clear', async (req, res) => {
        try {
            await forecastDb.clearDatabase();
            res.status(200).end();
        }
        catch(error) {
            console.log(error);
            res.status(500).end();
        }
    });
}

export default coordsRouter;
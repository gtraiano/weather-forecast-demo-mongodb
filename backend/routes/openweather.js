import owService from '../services/OpenWeather/OpenWeatherOneCall.js';
import { Router } from 'express';
import { TEMP_API_KEY } from '../middleware/useTemporaryAPIKey/index.js';

const openWeatherRouter = Router();

openWeatherRouter.get('/openweather/:lat/:lon', async (req, res) => {
/* OpenWeather call by lat, lon */
    try {
        const data = await owService.fetchCity(req.params.lat, req.params.lon, req[TEMP_API_KEY]);
        res.json(data);
    }
    catch(error) {
        if(error.isAxiosError) {
            // OpenWeather api has returned error
            res.status(error.response.status).json({ error: error.response.data.message ?? error.message });
        }
        else {
            res.status(404).json({ error: error.message });
        }
    }
});

export default openWeatherRouter;
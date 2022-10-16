import { Router } from "express";
import { HEADERS } from "./routes.js";
import { searchCity, searchLatLon } from "../services/Nominatim/index.js";

const nominatimRouter = Router();

nominatimRouter.get('/nominatim/:name', async (req, res, next) => {
/* Nominatim search by name */
    try {
        const data = await searchCity(req.params.name, req.get(HEADERS.locale) || 'en');
        res.json(data);
    }
    catch(error) {
        res.status(404).json({ error: error.message });
        next(error.message);
    }
})

nominatimRouter.get('/nominatim/:lat/:lon', async (req, res, next) => {
/* reverse Nominatim search by lat, lon */
    try {
        const data = await searchLatLon(req.params.lat, req.params.lon, req.get(HEADERS.locale) || 'en');
        res.json(data);
    }
    catch(error) {
        res.status(404).json({ error: error.message });
        next(error.message);
    }
})

export default nominatimRouter;
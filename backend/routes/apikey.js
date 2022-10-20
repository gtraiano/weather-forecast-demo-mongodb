import { Router, text } from "express";
import config from "../config/index.js";
import { getTempAPIKey, setTempAPIKey } from '../middleware/useTemporaryAPIKey/index.js'
import OpenWeatherOneCall from "../services/OpenWeather/OpenWeatherOneCall.js";

const apiKeyRouter = Router();

apiKeyRouter.get('/apikey', (req, res) => {
// return 200 if OpenWeather API key has been set, otherwise return 204
// if using temporary API key, look up per request IP address and respond accordingly (200 or 204)
    /*const status = !OpenWeatherOneCall.usesTempOWApiKey()
        ? OpenWeatherOneCall.getOWApiKey()?.length > 0 ? 200 : 204
        : getTempAPIKey(req.ip) ? 200 : 204;
    res.status(status).end();*/
    if(!OpenWeatherOneCall.usesTempOWApiKey()) {
        res.status(OpenWeatherOneCall.getOWApiKey()?.length > 0 ? 200 : 204).end();
    }
    else {
        res
            .status(getTempAPIKey(req.ip) ? 200 : 204)
            .set('Content-Type', 'text/plain')
            .send(getTempAPIKey(req.ip) ?? '');         // send plaintext key
    }
});

apiKeyRouter.post('/apikey', text(), (req, res) => {
// set OpenWeather API key
// if temporary API key is in use, sets a new entry per request IP address
    console.log('/apikey POST body', req.body)
    let key;
    // if key is sent as text in JSON form (expected from beacon)
    if(typeof req.body === 'string') {
        try {
            key = JSON.parse(req.body).key;
        }
        catch(error) {
            return res.status(400).json({ error: 'Expected JSON compatible form'}).end();
        }
    }
    // sent as JSON
    else if(typeof req.body === 'object') {
        key = req.body.key;
    }

    key = key ? key.trim() : key;

    if(key === undefined || key?.length === 0) return res.status(400).json({ error: 'Empty key provided'}).end();

    if(OpenWeatherOneCall.usesTempOWApiKey()) {                 // if temporary API key in use
        setTempAPIKey(req.ip, key)                              // create entry per request IP address
            ? res.status(getTempAPIKey(req.ip) ? 201 : 204)
                .set('Content-Type', 'text/plain')
                .send(getTempAPIKey(req.ip))                    // respond with created key value (or null if no key exists for request ip)
                .end()
            : res.status(500).end()                             // respond with failure
    }
    else {
        try {
            OpenWeatherOneCall.setOWApiKey(key);                // set key in service
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(key)                                      // respond with newly set key value
                .end();
        }
        catch(e) {
            res.status(403).end();
        }
    }
});

if(process.env.NODE_ENV === 'test') {
    const originalConfig = {
        apiKey: config.openWeather.OW_API_KEY,
        allowSetOWApiKey: config.openWeather.ALLOW_SET_OW_API_KEY
    };
    // query use of temporary API keys
    apiKeyRouter.get('/apikey/allowtemp', (req, res) => {
        const allowed = config.openWeather.OW_API_KEY !== undefined && config.openWeather.ALLOW_SET_OW_API_KEY === false;
        res.status(allowed ? 200 : 403).end();
    });
    // unset permanent API key to enable use of temporary keys
    apiKeyRouter.put('/apikey/allowtemp', (req, res) => {
        config.openWeather.OW_API_KEY = undefined;
        config.openWeather.ALLOW_SET_OW_API_KEY = true;
        res.status(200).end();
    });
    // reset permanent API key to its original value
    apiKeyRouter.post('/apikey/reset', (req, res) => {
        config.openWeather.OW_API_KEY = originalConfig.apiKey;
        config.openWeather.ALLOW_SET_OW_API_KEY = originalConfig.allowSetOWApiKey;
        res.status(200).end();
    })
}

export default apiKeyRouter;
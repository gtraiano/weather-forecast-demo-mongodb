/*

PATH						METHOD			PARAMETERS 						HEADERS 										ACTION

/coords 					GET 																							get all cities in database
/coords/refetch 			GET 																							fetch forecast data from OpenWeather, update and return updated cities in database

/coords/:lat/:lon 			GET 			lat=latitude lon=longitude 														get data from database
/coords/:lat/:lon/refetch 	GET 			lat=latitude lon=longitude 														fetch forecast data from OpenWeather and update existing record

/coords						POST 			post data in request body														insert city in database (requires data in request body)
/coords/:lat/:lon			POST 			lat=latitude lon=longitude		Locales = comma separated list of locales		insert city in database (does not require data in request body)

/coords/:lat/:lon 			PUT 			lat=latitude lon=longitude 														update city in database

/coords/:lat/:lon 			DELETE 			lat=latitude lon=longitude 														delete city from database

/openweather/:lat/:lon 		GET 			lat=latitude lon=longitude 														OpenWeather forecast search

/nominatim/:name 			GET 											Locale = search results locale					Nominatim search
/nominatim/:lat:/lon 		GET 			lat=latitude lon=longitude 		Locale = search result locale					Nominatim reverse search

/ping						GET																								returns 'pong' (check if backend is running)

/apikey						GET																								returns 200/204 depending on whether OpenWeather API key (permanent or temporary) is set
																															if a temporary key is used, performs a lookup by request ip and responds accordingly
/apikey						POST			in request body: key=string|null												if setting OpenWeather API key is allowed, sets API key and returns 200 along with API key value
																															otherwise returns 403
																															if temporary API keys are in use, sets a temporary OpenWeather API key to 'key' and returns 201 along with key value
																															key value of null removes temporary API key for request IP address

*/

import { Router, json } from 'express';
import pingRouter from './ping.js';
import coordsRouter from './coords.js';
import apiKeyRouter from './apikey.js';
import nominatimRouter from './nominatim.js';
import openWeatherRouter from './openweather.js';

const router = Router();

// middleware
router.use(json());

// routes
router.use(pingRouter);
router.use(apiKeyRouter);
router.use(coordsRouter);
router.use(openWeatherRouter);
router.use(nominatimRouter);

export default router;
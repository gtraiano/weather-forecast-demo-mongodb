/*

PATH						METHOD			PARAMETERS 						HEADERS 										ACTION

/coords 					GET 																							get all cities in database
/coords/refetch 			GET 																							fetch forecast data from OpenWeather, update and return updated cities in database

/coords/:lat/:lon 			GET 			lat=latitude lon=longitude 														get data from database
/coords/:lat/:lon/refetch 	GET 			lat=latitide lon=longitude 														fetch forecast data from OpenWeather and update existing record

/coords						POST 			post data in request body														insert city in database (requires data in request body)
/coords/:lat/:lon			POST 			lat=latitude lon=longitude		Locales = comma separated list of locales		insert city in database (does not require data in request body)

/coords/:lat/:lon 			PUT 			lat=latitude lon=longitude 														update city in database

/coords/:lat/:lon 			DELETE 			lat=latitude lon=longitude 														delete city from database

/openweather/:lat/:lon 		GET 			lat=latitude lon=longitude 														OpenWeather forecast search

/nominatim/:name 			GET 											Locale = search results locale					Nominatim search
/nominatim/:lat:/lon 		GET 			lat=latitude lon=longitude 		Locale = search result locale					Nominatim reverse search

/ping						GET																								returns 'pong' (check if backend is running)
/apikey						GET																								returns true/false depending on wether OpenWeather API key is set
/apikey						POST			key='key'																		sets OpenWeather API key to 'key'

*/

const { searchCity } = require('./services/NominatimSearch');
const { searchLatLon } = require('./services/NominatimReverse');
const owService = require('./services/OpenWeatherOneCall');
const forecastDb = require('./forecastDatabase');

// special request headers names
const headers = {
	refetch: 'Refetch', 	// set to 'true' or '1' to fetch forecast data from OpenWeather
	locales: 'Locales',		// Nominatim search for multiple locales ('en', 'el')
	locale: 'Locale' 		// Nominatim search for single locale
};

const removeId = (req, res, next) => {
/* removes _id property when returning database documents as json */
// https://lemnik.wordpress.com/2017/07/31/writing-express-middleware-to-modify-the-response/
	res.format({
		'application/json': () => {
			const json_ = res.json;
			res.json = function(data) {
				if(data instanceof Array) {
					data.forEach(item => {
						if (Object(item).hasOwnProperty('_id'))
							delete item._id;
					});
				}
				else if(typeof data === 'object') {
					if (Object(data).hasOwnProperty('_id'))
						delete data._id;
				}
				json_.call(res, data);
			}
		}
	});

	next();
};

/*
const unixToJsDatetime = (req, res, next) => {
	res.format({
		'application/json': () => {
			const json_ = res.json;
			res.json = function(data) {
				if(data instanceof Array) {
					data.forEach(item => {
						if (Object(item).hasOwnProperty('hourly'))
							item.hourly.forEach(hr => {
								hr.dt *= 1000;
							})
					});
				}
				else if(typeof data === 'object') {
					if (Object(data).hasOwnProperty('hourly'))
						data.hourly.forEach(hr => {
							hr.dt *= 1000;
						})
				}
				json_.call(res, data);
			}
		}
	});

	next();
}
*/

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

const express = require('express');
const router = express.Router();
const { setTempAPIKey, hasTempAPIKey, useTempAPIKey, getTempAPIKey, TEMP_API_KEY } = require('./middleware/useTemporaryAPIKey');

// middleware
router.use(express.json());
router.use(removeId);
//router.use(unixToJsDatetime);

// routes
router.get('/coords', async (req, res, next) => {
/* get all cities from database */
	let results = await forecastDb.allCities();
	res.json(results);
});

router.get('/coords/refetch', async (req, res, next) => {
/* get all cities from database and refreshes their forecast data */
	let results = await forecastDb.allCities();
	
	results = await Promise.all(
		results.map( async city => {
			try {
				const updated = await refetchForecastData(city.lat, city.lon);
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

router.get('/coords/:lat/:lon', async (req, res, next) => {
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

router.get('/coords/:lat/:lon/refetch', async (req, res, next) => {
/* get city by lat & lon */
	try {
		let forecastData = null;
		let cityData = await forecastDb.findCity(req.params.lat, req.params.lon);

		const updated = await refetchForecastData(req.params.lat, req.params.lon, req[TEMP_API_KEY]);
		forecastData = await forecastDb.updateCity(req.params.lat, req.params.lon, { ...cityData, ...updated });
		res.json(forecastData);
	}
	catch(error) {
		res.status(404).json({ error: error.message });
		next(error.message);
	}
});

router.put('/coords/:lat/:lon', async (req, res, next) => {
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

router.post('/coords', async (req, res, next) => {
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

router.post('/coords/:lat/:lon', async (req, res, next) => {
/* add city with coordinates (no data in body required) */
	try {
		if(typeof req.get(headers.locales) === 'undefined') {
			res.status(400).end();
			return;
		}

		const locales = req.get(headers.locales).split(',');
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

router.delete('/coords/:lat/:lon', async (req, res, next) => {
	try {
		await forecastDb.removeCity(req.params.lat, req.params.lon);
		res.status(200).end();
	}
	catch(error) {
		res.status(404).end();
		next(error.message);
	}
});

router.get('/openweather/:lat/:lon', async (req, res, next) => {
/* OpenWeather call by lat, lon */
	try {
		console.log('temp api key', req[TEMP_API_KEY])
		const data = await owService.fetchCity(req.params.lat, req.params.lon, req[TEMP_API_KEY]);
		res.json(data);
	}
	catch(error) {
		res.status(404).json({ error: error.message });
		next(error.message);
	}
});

router.get('/nominatim/:name', async (req, res, next) => {
/* Nominatim search by name */
	try {
		const data = await searchCity(req.params.name, req.get(headers.locale) || 'en');
		res.json(data);
	}
	catch(error) {
		res.status(404).json({ error: error.message });
		next(error.message);
	}
})

router.get('/nominatim/:lat/:lon', async (req, res, next) => {
/* reverse Nominatim search by lat, lon */
	try {
		const data = await searchLatLon(req.params.lat, req.params.lon, req.get(headers.locale) || 'en');
		res.json(data);
	}
	catch(error) {
		res.status(404).json({ error: error.message });
		next(error.message);
	}
})

router.get('/ping', (req, res) => {
	res.send('pong');
});

router.get('/apikey', (req, res) => {
// return whether Open Weather API key has been set
	res.status(200).send(
		owService.usesTempApiKey					// if using temporary API key
			? hasTempAPIKey(req.ip)					// look up per request IP
			: owService.getOWApiKey()?.length > 0	// otherwise check the key set in .env
	);
});

router.post('/apikey', (req, res) => {
	if(req.body.key !== undefined) {
		setTempAPIKey(req.ip, String(req.body.key));
		//owService.setOWApiKey(req.body.key);
		//res.status(200).send(owService.getOWApiKey()); // respond with newly set key
		res.cookie(
			'apiKey',
			getTempAPIKey(req.ip),
			{
				secure: true
			}
		)
		res.status(200).send(getTempAPIKey(req.ip)) // respond with newly set key
	}
	else {
		res.status(400).end();
	}
})

module.exports = router;
/* Module for OneCall OpenWeather API. Returns historical data for a city for 48 hours. */
const axios = require('axios');

const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
let apiKey = process.env.OW_API_KEY?.trim();
let usesTempApiKey = apiKey === undefined;


// params = (lat, lon)
const prepareQuery = (lat, lon, tempKey = undefined) => {
	return `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${tempKey ?? apiKey}`;
}

// fetch single query
const fetchQuery = async (query, retries = 2) => {
	try {
		console.log(`Fetching ${query}`)
		return await axios.get(query, { timeout: 1073741824 }); // needs to be resolved
	}
	catch (error) {
		console.log(`Retrying ${query}`)
		if (retries === 1) {
			console.log(`Failed ${query}`);
			throw new Error(`Failed ${query}`);
		}
		
		// introduce a delay?
		return fetchQuery(query, retries - 1);
	}
}

// mass api query for multiple cities
const fetchBatch = async (batch, tempKey) => {
	let data = [];

	data = batch.map(async (entry, index) => { // entry = { id, name, lat, lon }
		let query = prepareQuery(entry.lat, entry.lon, tempKey)
		let response;
		try {
			response = await Promise.resolve(fetchQuery(query));
			return ({
				cityId: entry.id,
				name: entry.name,
				...response.data
			});
		}
		catch(error) {
			return ({
				cityId: entry.id,
				name: entry.name,
			});
		}
	});

	return Promise.all(data);
}

const fetchCity = async (lat, lon, tempKey) => {
	const response = await Promise.resolve(fetchQuery(prepareQuery(lat, lon, tempKey)));
	return response.data;
}

// query api for all cities
const fetchAllCities = async (cityList, tempKey) => {
	const response = await fetchBatch(cityList, tempKey);
	return response;
}

const setOWApiKey = key => {
	if(usesTempApiKey && key === null) { // clear temp api key
		apiKey = null;
		console.log('cleared temp OpenWeather API key');
	}
	else if(key) {
		apiKey = key;
		console.log('setOWApiKey', key);
	}
}

const getOWApiKey = () => {
	return apiKey;
}

module.exports = { fetchAllCities, fetchCity, getOWApiKey, setOWApiKey, usesTempApiKey }
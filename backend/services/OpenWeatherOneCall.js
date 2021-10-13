/* Module for OneCall OpenWeather API. Returns historical data for a city for 48 hours. */
const axios = require('axios');

const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
let apiKey = process.env.OW_API_KEY;
let usesTempApiKey = process.env.OW_API_KEY.trim().length === 0;


// params = (lat, lon)
const prepareQuery = (lat, lon) => {
	return `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
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
		
		setTimeout(() => {}, 200);
		return fetchQuery(query, retries - 1);
	}
}

// mass api query for multiple cities
const fetchBatch = async batch => {
	let data = [];

	data = batch.map(async (entry, index) => { // entry = { id, name, lat, lon }
		let query = prepareQuery(entry.lat, entry.lon)
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

const fetchCity = async (lat, lon) => {
	const response = await Promise.resolve(fetchQuery(prepareQuery(lat, lon)));
	return response.data;
}

// query api for all cities
const fetchAllCities = async (cityList) => {
	const response = await fetchBatch(cityList);
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

module.exports = { fetchAllCities, fetchCity, getOWApiKey, setOWApiKey }
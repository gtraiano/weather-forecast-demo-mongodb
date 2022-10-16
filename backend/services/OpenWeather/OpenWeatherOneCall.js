/* Module for OneCall OpenWeather API. Returns historical data for a city for 48 hours. */
import config from '../../config/index.js';
import { fetchQuery } from '../utils/index.js';

const baseUrl = 'https://api.openweathermap.org/data/2.5/onecall';
let apiKey = config.openWeather.OW_API_KEY;
let usesTempOWApiKey = () => config.openWeather.usesTempAPIKey();


// params = (lat, lon)
const prepareQuery = (lat, lon, tempKey = undefined) => {
	return `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${tempKey ?? apiKey}`;
}

// mass api query for multiple cities
const fetchBatch = async (batch, tempKey) => {
	let data = [];

	data = batch.map(async entry => { // entry = { id, name, lat, lon }
		let query = prepareQuery(entry.lat, entry.lon, tempKey);
		let locData;
		try {
			locData = await fetchQuery(query, 2);
			return ({
				cityId: entry.id,
				name: entry.name,
				...locData
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
	const response = await fetchQuery(prepareQuery(lat, lon, tempKey));
	return response;
}

// query api for all cities
const fetchAllCities = async (cityList, tempKey) => {
	const response = await fetchBatch(cityList, tempKey);
	return response;
}

const setOWApiKey = key => {
	if(!config.openWeather.ALLOW_SET_OW_API_KEY) throw Error('Setting OpenWeather API key is disabled');
	apiKey = key;
	console.log('Set OpenWeather API key to', apiKey);
}

const getOWApiKey = () => apiKey;

export default {
	fetchAllCities,
	fetchCity,
	getOWApiKey,
	setOWApiKey,
	usesTempOWApiKey
}
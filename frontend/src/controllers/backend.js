import axios from 'axios';

const protocol = process.env.EXPRESS_SERVER_PROTOCOLS.split(',').map(p => p.trim().toLowerCase()).includes('https') ? 'https' : 'http';
const backendPort = protocol === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : EXPRESS_SERVER_HTTP_PORT;
const baseUrl = `${protocol}://${process.env.BACKEND_DOMAIN}:${backendPort}${process.env.BACKEND_API_ENDPOINT}`;

// Nominatim calls
const nominatimSearchName = async (name, locale) => {
	try {
		const results = await axios.get(`${baseUrl}nominatim/${name}`, { headers: { Locale: locale }});
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const nominatimSearchLatLon = async (lat, lon, locale) => {
	try {
		const results = await axios.get(`${baseUrl}nominatim/${lat}/${lon}`, { headers: { Locale: locale } });
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// OpenWeather call
const openWeatherSarch = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}openweather/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database get city
const getAllCities = async () => {
	try {
		const results = await axios.get(`${baseUrl}coords`);
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const updateAllCities = async () => {
	try {
		const results = await axios.get(`${baseUrl}coords/refetch`);
		return results.data;
	}
	catch(error) {
		console.error(error.message);
	}	
}

const getCityLatLon = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}coords/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const updateCityLatLon = async (lat, lon) => {
	try {
		const result = await axios.get(`${baseUrl}coords/${lat}/${lon}/refetch`);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}


// database put city
const putCityLatLon = async (lat, lon, data) => {
	try {
		const result = axios.put(`${baseUrl}coords`, data);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database delete city
const deleteCityLatLon = async (lat, lon, locale) => {
	try {
		const result = await axios.delete(`${baseUrl}coords/${lat}/${lon}`);
		return result;
	}
	catch(error) {
		console.error(error.message);
	}
}

// database post city
const postCityLatLon = async (lat, lon, locales) => {
	try {
		const result = await axios.post(`${baseUrl}coords/${lat}/${lon}`, {}, { headers: { Locales: locales.toString() } });
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const postCity = async data => {
	try {
		const result = await axios.post(`${baseUrl}coords`, data);
		return result.data;
	}
	catch(error) {
		console.error(error.message);
	}
}

const getDetailedForecastLatLon = async (lat, lon) => {
	try {
		const result = await axios.post(`${baseUrl}detailed/${lat}/${lon}`);
		return result.data;
	}
	catch(error) {
		console.error(error);
	}
}

export { 
	nominatimSearchName,
	nominatimSearchLatLon,
	openWeatherSarch,
	getAllCities,
	updateAllCities,
	getCityLatLon,
	updateCityLatLon,
	putCityLatLon,
	deleteCityLatLon,
	postCityLatLon,
	postCity,
	getDetailedForecastLatLon
};
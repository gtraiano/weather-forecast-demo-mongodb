import axios from 'axios';

let backendProtocol = process.env.EXPRESS_SERVER_PROTOCOLS.split(',').map(p => p.trim().toLowerCase()).includes('https') ? 'https' : 'http';
let backendDomain = process.env.BACKEND_DOMAIN;
let backendPort = backendProtocol === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : process.env.EXPRESS_SERVER_HTTP_PORT;
let backendEndpoint = process.env.BACKEND_API_ENDPOINT;
let baseUrl = `${backendProtocol}://${backendDomain}:${backendPort}${backendEndpoint}`;

const pingTimeout = 3000;
// ping active protocol and return status code
const pingActiveProtocol = async () => {
	try {
		const res = await axios.get(
			`${baseUrl}ping`,
			{
				timeout: pingTimeout,
				headers: { 'Access-Control-Allow-Origin': true }
			}
		)

		return res.status;
	}
	catch(error) {
		return 404;
	}
}

// ping specific protocol and return { protocol, url, status }
const pingProtocol = async protocol => {
	let res;
	let prot = protocol.toLowerCase();
	let url = `${prot}://${process.env.BACKEND_DOMAIN}:${prot === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : process.env.EXPRESS_SERVER_HTTP_PORT}${process.env.BACKEND_API_ENDPOINT}ping`;
	let status;
	try {
		res = await axios.get(
			url,
			{
				timeout: pingTimeout,
				headers: { 'Access-Control-Allow-Origin': true } 
			}
		);
		status = res.status;
	}
	catch(error) {
		status = 404;
	}
	finally {
		return { protocol: prot, url: url.match(/(.*:\d+)/g)[0], status };
	}
}

// get and set backend parameters
const setActiveProtocol = value => {
	backendProtocol = value;
	backendPort = backendProtocol === 'https' ? process.env.EXPRESS_SERVER_HTTPS_PORT : process.env.EXPRESS_SERVER_HTTP_PORT;
	baseUrl = `${backendProtocol}://${process.env.BACKEND_DOMAIN}:${backendPort}${process.env.BACKEND_API_ENDPOINT}`;
}

const getActiveProtocol = () => backendProtocol

const getActivePort = () => backendPort

const setBackendUrl = url => {
/* parse url and set backend parameters */
	const params = [...url.matchAll(/(.*):\/{2}(.+?):??(?=\d+)(\d*?)(\/.*)/gm)];
	if(!params.length) return;
	
	backendProtocol = params[1];
	backendDomain = params[2];
	backendPort = params[3] || 80;
	backendEndpoint = params[4];
	baseUrl = url;
}

const getOWApiKey = async () => {
	try {
		const response = await axios.get(`${baseUrl}apikey`);
		return response.data;
	}
	catch(error) {
		throw new Error('API key could not be retrieved.', error.message);
	}
}

const setOWApiKey = async key => {
	try {
		const response = await axios.post(`${baseUrl}apikey?key=${key}`);
		return response.data;
	}
	catch(error) {
		throw new Error('API key could not be set.', error.message);
	}
}

// Nominatim calls
const nominatimSearchName = async (name, locale) => {
	const results = await axios.get(`${baseUrl}nominatim/${name}`, { headers: { Locale: locale }});
	return results.data;
}

const nominatimSearchLatLon = async (lat, lon, locale) => {
	const results = await axios.get(`${baseUrl}nominatim/${lat}/${lon}`, { headers: { Locale: locale } });
	return results.data;
}

const generateErrorMessage = error => axios.isAxiosError(error) && error?.response?.data?.message ? error.response.data.message : error.message;

// OpenWeather call
const openWeatherSarch = async (lat, lon) => {
	const result = await axios.get(`${baseUrl}openweather/${lat}/${lon}`);
	return result.data;
}

// database calls
// database get city
const getAllCities = async () => {
	const results = await axios.get(`${baseUrl}coords`);
	return results.data;
}

const updateAllCities = async () => {
	const results = await axios.get(`${baseUrl}coords/refetch`);
	return results.data;
}

const getCityLatLon = async (lat, lon) => {
	const result = await axios.get(`${baseUrl}coords/${lat}/${lon}`);
	return result.data;
}

const updateCityLatLon = async (lat, lon) => {
	const result = await axios.get(`${baseUrl}coords/${lat}/${lon}/refetch`);
	return result.data;
}


// database put city
const putCityLatLon = async (lat, lon, data) => {
	const result = axios.put(`${baseUrl}coords`, data);
	return result.data;
}

// database delete city
const deleteCityLatLon = async (lat, lon, locale) => {
	const result = await axios.delete(`${baseUrl}coords/${lat}/${lon}`);
	return result;
}

// database post city
const postCityLatLon = async (lat, lon, locales) => {
	const result = await axios.post(`${baseUrl}coords/${lat}/${lon}`, {}, { headers: { Locales: locales.toString() } });
	return result.data;
}

const postCity = async data => {
	const result = await axios.post(`${baseUrl}coords`, data);
	return result.data;
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
	pingActiveProtocol,
	pingProtocol,
	setActiveProtocol,
	getActiveProtocol,
	getActivePort,
	setBackendUrl,
	getOWApiKey,
	setOWApiKey,
	generateErrorMessage
};
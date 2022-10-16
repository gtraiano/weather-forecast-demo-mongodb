import { fetchQuery } from '../utils/index.js';
import { prepareQuery } from './utils/index.js';

const baseUrl = 'https://nominatim.openstreetmap.org';
const endpoint = '/reverse';
const format = 'json';

const searchLatLon = async (lat, lon, locale) => {
	try {
		const data = await fetchQuery(
			prepareQuery(
				baseUrl,
				endpoint,
				[
					{ name: 'format', value: format },
					{ name: 'lat', value: lat },
					{ name: 'lon', value: lon },
					{ name: 'accept-language', value: locale }
				]
			)
		);
		return data;
	}
	catch (error) {
		console.log(error.message);
	}
}

export default searchLatLon;
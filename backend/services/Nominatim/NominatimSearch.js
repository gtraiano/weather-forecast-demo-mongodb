import { fetchQuery } from '../utils/index.js';
import { prepareQuery } from './utils/index.js';

const baseUrl = 'https://nominatim.openstreetmap.org';
const endpoint = '/search';
const format = 'json';

const searchCity = async (cityName, locale) => {
	const data = await fetchQuery(
		prepareQuery(
			baseUrl,
			endpoint,
			[
				{ name: 'format', value: format },
				{ name: 'city', value: cityName },
				{ name: 'accept-language', value: locale }
			]
		)
	);
	//return response.data.filter(res => res.class == 'place'); // keep cities/villages only
	return data;
}

export default searchCity;
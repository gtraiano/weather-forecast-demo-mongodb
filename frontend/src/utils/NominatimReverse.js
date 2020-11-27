import axios from 'axios';

const baseUrl = 'http://nominatim.openstreetmap.org';
const endpoint = '/reverse';
const format = '?format=json';

/* params = [{ name: parameter name, value: parameter value }] */
const prepareQuery = params => {
	let query = `${baseUrl}${endpoint}${format}`;
	params.forEach(param => {
		query = query.concat(`&${param.name}=${param.value}`);
	})

	return query;
}

const fetchQuery = async (query, retries = 5) => {
	try {
		console.log(`Fetching ${query}`)
		return await axios.get(query); // needs to be resolved
	}
	catch (error) {
		console.log(`Retrying ${query}`)
		if (retries === 1) {
			console.log(`Failed ${query}`);
			throw error
		}
		
		setTimeout(() => {}, 100)
		return fetchQuery(query, retries - 1);
	}
}

const searchLatLon = async (lat, lon, locale) => {
	try {
		const response = await fetchQuery(
			prepareQuery(
				[
					{ name: 'lat', value: lat },
					{ name: 'lon', value: lon },
					{ name: 'accept-language', value: locale }
				]
			)
		);
		return response.data;
	}
	catch (error) {
		console.log(error.message);
	}
}

export default searchLatLon
const axios = require('axios').default;

const baseUrl = 'http://nominatim.openstreetmap.org';
const endpoint = '/search';
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

const searchCity = async (cityName, locale) => {
	try {
		const response = await fetchQuery(
			prepareQuery(
				[
					{ name: 'city', value: cityName },
					{ name: 'accept-language', value: locale }
				]
			)
		);
		//return response.data.filter(res => res.class == 'place'); // keep cities/villages only
		return response.data;
	}
	catch (error) {
		console.log(error.message);
	}
}

module.exports = { searchCity };
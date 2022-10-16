import axios from 'axios';
import config from '../../config/index.js';

// https://stackoverflow.com/questions/74004759/how-can-i-set-async-for-settimeout-in-javascript
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

export const fetchQuery = async (query, retries = 2) => {
	try {
		console.log(`Fetching ${query}`)
		const response = await axios.get(query);
		return response.data;
	}
	catch(error) {
		if(retries === 0) {
			console.log(`Failed ${query}`);
			throw error;
		}
		await timeout(config.openWeather.DELAY_AFTER_ERROR);
		console.log(`Retrying ${query}`);
		return await fetchQuery(query, retries - 1);
	}
}
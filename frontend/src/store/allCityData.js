import store from './'
//import { fetchAllCities, fetchCity } from '../utils/OpenWeatherOneCall'
//import searchCity from '../utils/NominatimSearch'
import { 
	getAllCities,
	updateAllCities,
	postCityLatLon,
	deleteCityLatLon,
	updateCityLatLon,
	openWeatherSarch
} from '../controllers/backend'

/*
city weather forecast object
------------------------------------------------------------------------------
	coords 						object		city coordinations
		lat 					float		latitude
		lon 					float		longitude
	
	name 						object 		city name in locales
		locale={en, el}			string 		name translation in locale (en, el)
	
	id 							int			id
	
	forecast 					object		2-day forecast for city
		hourlyWeatherIcon 		[string]	hourly weather icon
		hourlyDt 				[int]		hourly datetime
		temperature 			[float]		hourly temperature
		humidity 				[float]		hourly humidity
		pressure 				[float]		hourly pressure
*/

const extractName = entry => {
	//console.log(entry.location['en'].address, entry.location['el'].address);
	return Object.assign(
		{},
		...store.i18n.availableLocales.map(
			locale => (
				{
					[locale]: entry.location[locale].city || entry.location[locale].town || entry.location[locale].village
						|| entry.location[locale].address.city || entry.location[locale].address.town || entry.location[locale].address.village || entry.location[locale].address.county || entry.location[locale].address.region
						|| entry.location[locale].address.state
				}
			)
		)
	)
}

const extractForecastData = entry => {
	return {
		hourlyWeatherIcon: entry.hourly.map(hour => `http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`),
		hourlyDt: entry.hourly.map(hour => hour.dt*1000), // unix to js datetime
		temperature: entry.hourly.map(hour => hour.temp),
		humidity: entry.hourly.map(hour => hour.humidity),
		pressure: entry.hourly.map(hour => hour.pressure)
	}
}

const transformDatabaseData = entry => {
/* transforms OpenWeather API response for use by the app */
	return {
		coords: { lat: entry.lat, lon: entry.lon },
		name: extractName(entry),
		id: entry.location.en.place_id,
		forecast: extractForecastData(entry)
	};
}

const state = () => ({
	allCityData: [], // forecast data for all cities
	lastChangedOn: 0 // datetime of last data fetch or data change
})

const getters = {
	getAllCityData: state => state.allCityData,
	getLastChangedOn: state => state.lastChangedOn,
	getCitiesCoords: state => new Map(state.allCityData.map(city => [`${city.coords.lat},${city.coords.lon}`, true]))
}

const actions = {
	setAllCityData: (context, data) => {
		context.commit('setAllCityData', data);
		context.commit('setLastChangedOn', Date.now());
	},

	setAllCityDataAsync: async (context, forceRefetch) => {
		let refetch = null;
		let upToDate = JSON.parse(window.localStorage.getItem('upToDate')) || 0;
		
		if(typeof forceRefetch !== 'undefined') {
			refetch = forceRefetch;
		}
		/*else {
			refetch = window.localStorage.getItem('allCityData') == null || // no data in local storage
					  window.localStorage.getItem('allCityData') == '[]' ||
					  //upToDate < Date.now() + 24*3600*1000 // data in local storage older than 24hrs
					  Math.floor((upToDate - Date.now())/3600000) <= 12
				? true
				: false
		}*/

		let data = refetch ? await updateAllCities() : await getAllCities();
		data = data.map(city => transformDatabaseData(city));
		
		console.log('Fetched forecast data from', refetch ? 'OpenWeather' : 'backend');
		
		context.commit('setAllCityData', data); // save api data to state
		window.localStorage.setItem('upToDate', JSON.stringify(data[0].forecast.hourlyDt[47]));

		context.commit('setLastChangedOn', Date.now());
	},

	setLastChangedOn: (context, datetime) => {
		context.commit('setLastChangedOn', datetime);
	},

	appendCityAsync: async (context, city) => {
		// check if city already exists
		/*let exists = context.state.allCityData.findIndex(entry => { // comparing lat & lon
			return entry.coords.lat == Number.parseFloat(city.lat) && entry.coords.lon == Number.parseFloat(city.lon)
		});
		if(exists != -1) {
			console.log(city.name, 'was not added because it already exists!');
			return;
		}*/
		//console.log('Adding city', {...city});
		let newCity = await postCityLatLon(city.lat, city.lon, store.i18n.availableLocales);

		context.commit('appendCity', transformDatabaseData(newCity));
		context.commit('setLastChangedOn', Date.now());
		store.dispatch('search/setAddedCities', { lat: newCity.lat, lon: newCity.lon });
		
	},

	updateCityForecastDataAsync: async (context, city) => {
		console.log(`Updating forecast data for ${city.name} lat:${city.coords.lat} lon:${city.coords.lon}`);
		const data = await updateCityLatLon(city.coords.lat, city.coords.lon);
		context.commit('updateCityForecastData', { lat: city.coords.lat, lon: city.coords.lon, data: transformDatabaseData(data) });
		context.commit('setLastChangedOn', Date.now());
	},

	removeCity: async (context, coords) => {
		await deleteCityLatLon(coords.lat, coords.lon);
		context.commit('removeCity', coords);
	}
}

const mutations = {
	setAllCityData: (state, data) => {
		state.allCityData = data;
	},

	setLastChangedOn: (state, datetime) => {
		state.lastChangedOn = datetime;
	},

	appendCity: (state, city) => {
		//city.id = Math.max(...state.allCityData.map(city => city.id)) + 1;
		state.allCityData = [...state.allCityData, city];
	},

	updateCityForecastData: (state, { lat, lon, data }) => {
		state.allCityData = [...state.allCityData.map(item => item.coords.lat !== lat && item.coords.lon !== lon ? item : data)];
		//state.allCityData = [...state.allCityData.filter(city => city.coords.lat !== lat && city.coords.lon !== lon ), data];
	},

	removeCity: (state, coords) => {
		state.allCityData = state.allCityData.filter(city => {
			return city.coords.lat != coords.lat && city.coords.lon != coords.lon;
		});
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
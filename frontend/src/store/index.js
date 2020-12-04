import Vue from 'vue'
import Vuex from 'vuex'
import chartData from './chartData'
import allCityData from './allCityData'
import locale from './locale'
import search from './search'
import i18n from '../lang/i18n.js'
import action from './action'

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

const store = new Vuex.Store({
	modules: {
		allCityData,
		chartData,
		locale,
		search,
		action
	},
	strict: debug
});

Vue.set(store, 'i18n', i18n) // expose i18n to store as 'store.i18n'

store.watch(
	(state, getters) => getters['locale/getLocale'], // when locale changes
	() => {
		store.dispatch('chartData/generateChartData', store.getters['allCityData/getAllCityData']); // generate plot data
		if (debug) {
			console.log(`Plot data generated on ${new Date(Date.now())}`);
		}
	}
)

store.watch(
	(state, getters) => getters['allCityData/getLastChangedOn'], // after forecast data has been fetched & saved
	(newValue, oldValue) => {
		store.dispatch('chartData/generateChartData', store.getters['allCityData/getAllCityData']); // generate plot data
		if (debug) {
			console.log(`City forecast data fetched on ${new Date(newValue)}`);
			console.log(`Plot data generated on ${new Date(Date.now())}`);
		}
	}
)

/*store.watch(
	(state, getters) => getters['allCityData/getAllCityData'], // on fetching forecast data
	(newValue, oldValue) => {
		//window.localStorage.setItem('allCityData', JSON.stringify(newValue)); // save to local storage
		if(debug) {
			console.log('Wrote forecast data to localStorage');
		}
	}
)*/

store.watch(
	(state, getters) => getters['action/getAnswer'], // on answering confirmation dialog
	(newValue, oldValue) => {
		if(debug && store.getters['action/getMessage']) {
			console.log('dialog for', store.getters['action/getMessage'], 'answered with', newValue);
		}
		if(newValue) {
			const { command, args } = store.getters['action/getCommand'];

			if(command === 'add'){
				store.dispatch('allCityData/appendCityAsync', args);
			}
			else if(command === 'delete') {
				store.dispatch('allCityData/removeCity', args);
			}
		}
		store.dispatch('action/clear');
	}
)

export default store
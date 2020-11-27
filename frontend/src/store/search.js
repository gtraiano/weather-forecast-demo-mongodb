import { nominatimSearchName } from '../controllers/backend';
import store from './'

const transform = results => {
    return results.map(result => {
        let regionInfo = result.display_name.split(',').map(s => s.trim());
        return {
            lat: result.lat,
            lon: result.lon,
            name: regionInfo[0],
            region: regionInfo[1],
            postCode: regionInfo[regionInfo.length - 2],
            country: regionInfo[regionInfo.length - 1]
        }
    })
}

const state = () => ({
	searchTerm: null,
	showResults: false,
	searchResults: [],
    addedCities: []
})

const getters = {
	getSearchTerm: state => state.searchTerm,
	getShowResults: state => state.showResults,
	getSearchResults: state => state.searchResults,
    getAddedCities: state => state.addedCities
}

const mutations = {
	setSearchTerm: (state, term) => {
		state.searchTerm = term;
    },

    setShowResults: (state, show) => {
    	state.showResults = show;
    },

    setSearchResults: (state, results) => {
    	state.searchResults = results;
    },

    setAddedCities: (state, cities) => {
        state.addedCities = cities;
    },

    clear: state => {
        state.searchTerm = null;
        state.showResults = false;
        state.searchResults = [];
        state.addedCities = [];
    }
}

const actions = {
	setSearchTerm: ({ commit }, term) => {
    	commit('setSearchTerm', term);
    },

    getSearchTerm: ({ commit }) => {
        commit('getSearchTerm');
    },

    setShowResults: ({ commit }, show) => {
    	commit('setShowResults', show);
    },

    setSearchResults: ({ commit }, results) => {
    	commit('setSearchResults', results);
    },

    setAddedCities: (context, cities) => {
        context.commit('setAddedCities', [...context.state.addedCities, cities])
    },

    getAddedCities: context => {
        context.commit('getAddedCities');
    },

    searchCity: async (context) => {
        let results = await nominatimSearchName(context.getters.getSearchTerm, store.getters['locale/getLocale']);
        context.commit('setSearchResults', transform(results));
    },

    clear: context => {
        context.commit('clear');
    }
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
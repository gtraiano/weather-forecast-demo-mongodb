const state = () => ({
	locale: window.localStorage.getItem('locale') || 'en'
})

const getters = {
	getLocale: state => state.locale
}

const mutations = {
	setLocale: (state, locale) => {
		state.locale = locale
    }
}

const actions = {
	setLocale: ({ commit }, locale) => {
    	commit('setLocale', locale)
    }
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
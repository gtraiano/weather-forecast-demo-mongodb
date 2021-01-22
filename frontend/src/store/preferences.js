import { pingProtocol, setActiveProtocol, getActiveProtocol, getActivePort } from '../controllers/backend';

const state = () => ({
	backend: {
		availableProtocols: [],
		activeProtocol : getActiveProtocol(),
		port: getActivePort()
	},

	frontend: {
		detailedForecastStyle: 'scrollbar'
	}
});

const getters = {
	getPreferences: state => state,
	getPreference: state => preference => state[preference],
	getAvailableProtocols: state => state.backend.availableProtocols
}

const actions = {
	setPreference: (context, { preference, value }) => {
		context.commit('setPreference', { preference, value });
	},

	initializeAvailableProtocols: context => {
		let protocols = [];
		['http', 'https'].forEach(async protocol => {
			const ping = await pingProtocol(protocol);
			if(ping && ping.status === 200) {
				let url = ping.request.responseURL.match(/(.*:\d+)/g)[0]; // extract url of backend
				protocols.push({ protocol, url });
				context.commit('setPreference', { preference: 'backend.availableProtocols', value: protocols });
			}
		});
		//context.commit('setPreference', { preference: 'backend.availableProtocols', value: protocols });
		context.commit('setPreference', { preference: 'backend.activeProtocol', value: getActiveProtocol() });
	},

	setActiveProtocol: async (context, value) => {
		const ping = await pingProtocol(value);
		if(!ping || ping.status !== 200) {
			return;
		}
		setActiveProtocol(value.toLowerCase());
		context.commit('setPreference', { preference: 'backend.activeProtocol', value: value });
		context.commit('setPreference', { preference: 'backend.port', value: getActivePort() });
	}
}

const mutations = {
	setPreference: (state, { preference, value }) => {
		const path = preference.split('.');
		
		if(value instanceof Array) {
			state[path[0]][path[1]] = [...value];
		}
		else if(/^\d+$/.test(value.toString())) { // numeric
			state[path[0]][path[1]] = Number.parseInt(value);
		}
		else if(/^[a-zA-Z]+$/.test(value.toString())) {
			state[path[0]][path[1]] = value;
		}
	}
}

export default {
	namespaced: true,
	state,
	getters,
	actions,
	mutations
}
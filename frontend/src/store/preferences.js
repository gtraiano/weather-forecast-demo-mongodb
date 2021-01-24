import {
	pingProtocol,
	setActiveProtocol,
	getActiveProtocol,
	getActivePort
} from '../controllers/backend';

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

	initializeAvailableProtocols: async context => {
		const protocols = await Promise.all(
			['http', 'https'].map(async protocol => {
				const ping = await pingProtocol(protocol);
				if(ping && ping.status === 200) {
					let url = ping.request.responseURL.match(/(.*:\d+)/g)[0]; // extract url of backend server
					return { protocol, url };
				}
			})
		);
		context.commit('setPreference', { preference: 'backend.availableProtocols', value: protocols });
		context.commit('setPreference', { preference: 'backend.activeProtocol', value: getActiveProtocol() });
	},

	setActiveProtocol: async (context, value) => {
		const ping = await pingProtocol(value); // ping to check if protocol is actually available
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
		const path = preference.split('.'); // preferences follow the form 'a.b'
		
		if(value instanceof Array) { // assume type of array elements is ok
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
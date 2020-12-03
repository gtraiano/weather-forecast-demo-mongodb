import store from './'

/*
  confirmation dialog
*/
const state = () => ({
	message: null, // confirmation window message
	title: null, // confirmation window title
	answer: null, // confirmation window answer
	show: false, // show confirmation window
	command: null // command to execute in the form { command: 'command' args: { args } }
})

const getters = {
	getMessage: state => state.message,
	getTitle: state => state.title,
	getAnswer: state => state.answer,
	getShow: state => state.show,
	getCommand: state => state.command
}

const mutations = {
	setMessage: (state, message) => {
		state.message = message;
	},

	setTitle: (state, title) => {
		state.title = title;
	},

	setAnswer: (state, answer) => {
		state.answer = answer;
	},

	setShow: (state, show) => {
		state.show = show;
	},

	setCommand: (state, command) => {
		state.command = command;
	}
}

const actions = {
	setMessage: (context, message) => {
		context.commit('setMessage', message);
	},

	setTitle: (context, title) => {
		context.commit('setTitle', title);
	},

	setAnswer: (context, answer) => {
		context.commit('setAnswer', answer);
	},

	setShow: (context, show) => {
		context.commit('setShow', show);
	},

	setCommand: (context, command) => {
		context.commit('setCommand', command);
	},

	clear: context => {
		context.commit('setTitle', null);
		context.commit('setMessage', null);
		context.commit('setAnswer', null);
		context.commit('setCommand', null);
		context.commit('setShow', false);
	},

	delete: (context, city) => {
		context.commit('setTitle', store.i18n.t('deleteTitle'));
		context.commit('setMessage', store.i18n.t('deleteMessage', [city.name[store.i18n.locale], `(lat: ${city.coords.lat} lon: ${city.coords.lon})`]));
		context.commit('setCommand', { command: 'delete', args: city.coords }); // delete { Lat: latitude lon: longitude }
		context.commit('setShow', true);
	},

	add: (context, city) => {
		context.commit('setTitle', store.i18n.t('addTitle'));
		context.commit('setMessage', store.i18n.t('addMessage', [city.name, `(lat: ${city.lat} lon: ${city.lon})`]));
		context.commit('setCommand', {
			command: 'add',
			args: {
				name: city.name[store.i18n.locale],
				lat: city.lat,
				lon: city.lon
			}
		}); // add { name: translatedName, lat: latitude, lon: longitude }
		context.commit('setShow', true);
	}
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
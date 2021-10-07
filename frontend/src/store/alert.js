/*
  alert for info, errors etc.
*/
const state = () => ({
	message: null, // alert message
	type: 'info', // info, success, danger... (b-alert variant values)
	show: false, // show alert
	timeout: 3 // timeout in seconds before alert closes automatically
})

const getters = {
	getMessage: state => state.message,
	getType: state => state.type,
	getShow: state => state.show,
	getTimeout: state => state.timeout
}

const mutations = {
	setMessage: (state, message) => {
		state.message = message;
	},

	setType: (state, type) => {
		state.type = type;
	},

	setShow: (state, show) => {
		state.show = show;
	}
}

const actions = {
	setMessage: (context, message) => {
		context.commit('setMessage', message);
	},

	setType: (context, type) => {
		context.commit('setType', type);
	},

	setShow: (context, show) => {
		context.commit('setShow', show);
	},

	display: (context, { message, type }) => {
		context.commit('setMessage', message);
		context.commit('setType', type);
		context.commit('setShow', true);
		setTimeout(() => context.dispatch('clear'), context.state.timeout*1000);
	},

	clear: context => {
		context.commit('setShow', false);
		context.commit('setMessage', null);
		context.commit('setType', null);
	}
}

export default {
	namespaced: true,
	state,
	getters,
	mutations,
	actions
}
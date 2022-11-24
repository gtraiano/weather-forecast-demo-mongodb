import config from "../config";

const timeLog = (req, res, next) => { // logging timestamp
	console.log(`${new Date().toLocaleString()} ${req.ip} ${req.protocol} ${req.method} ${req.path} ${res.statusCode}`);
	next();
};

const checkRefetchDisabled = (req, res, next) => {
	if(config.openWeather.DISABLE_REFETCH && /refetch$/gi.test(req.path)) {
		res.status(401).json({ message: 'Refetch forecast data from OpenWeather is disabled'});
		next('Refetch forecast data from OpenWeather is disabled');
	}
	else {
		next();
	}
};

export {
	timeLog,
	checkRefetchDisabled
}
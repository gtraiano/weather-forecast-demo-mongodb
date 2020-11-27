require('dotenv').config();

const router = require('./routes');
const searchCity = require('./services/NominatimSearch');
const searchLatLon = require('./services/NominatimReverse');
const owService = require('./services/OpenWeatherOneCall');
const forecastDb = require('./forecastDatabase');

// server components
const express = require('express');
const cors = require('cors');
const compression = require('compression')

const server = express();

// middleware
server.use(function timeLog (req, res, next) { // logging timestamp
	console.log(`${new Date().toLocaleString()} ${req.method} ${req.path} ${res.statusCode}`);
	next();
});
server.use(compression());
server.use(cors());
server.use(process.env.BACKEND_API_URL, router);

// listen to port
server.listen(process.env.EXPRESS_SERVER_PORT, async () => {
	console.log(`Express server is running on port ${process.env.EXPRESS_SERVER_PORT}`);
	await forecastDb.connect();
	//await forecastDb.clearDatabase();
});

// cleanup process
process.on('exit', async () => {
	await forecastDb.close();
	server.close();
});

process.on('close', async () => {
	await forecastDb.close();
	server.close();
});

process.on('SIGINT', async () => {
	await forecastDb.close();
	server.close();
	process.exitCode = 0;
});

process.on('SIGTERM', async () => {
	await forecastDb.close();
	server.close();
	process.exitCode = 0;
});

/*process.on('uncaughtException', () => {
	console.log('Express server failed');
	process.exitCode = 1;
})*/
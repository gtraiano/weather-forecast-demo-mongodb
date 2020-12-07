require('dotenv').config();

const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const privateKey  = fs.readFileSync(path.resolve(__dirname, process.env.PRIVATE_KEY), 'utf8');
const certificate = fs.readFileSync(path.resolve(__dirname,process.env.CERTIFICATE), 'utf8');
const credentials = { key: privateKey, cert: certificate };

const router = require('./routes');
const searchCity = require('./services/NominatimSearch');
const searchLatLon = require('./services/NominatimReverse');
const owService = require('./services/OpenWeatherOneCall');
const forecastDb = require('./forecastDatabase');

// server components
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const server = express();

// middleware
server.use(function timeLog (req, res, next) { // logging timestamp
	console.log(`${new Date().toLocaleString()} ${req.method} ${req.path} ${res.statusCode}`);
	next();
});
server.use(compression());
server.use(cors());
server.use(process.env.BACKEND_API_URL, router);

// http & https servers
const httpServer = http.createServer(server);
const httpsServer = https.createServer(credentials, server);

// connect to db up to #retries attempts
const connectDb = async (retries = 5) => {
	try {
		console.log('Connecting to MongoDB server')
		await forecastDb.connect();
		console.log('Connected to MongoDB server on port', process.env.MONGODB_PORT);	
	}
	catch(error) {
		if(retries === 1) {
			console.error('Exiting');
			process.exitCode = 1;
			process.exit();
		}
		console.error(`Failed to connect to MongoDB server on port ${process.env.MONGODB_PORT} [Error: ${error.message}]`);
		console.log(`Retrying to connect to MongoDB server, remaining attempts: ${retries - 1}`);
		return connectDb(retries - 1);
	}
}

// init database connection and server listening ports
connectDb()
	.then(() => {
		httpServer.listen(process.env.EXPRESS_SERVER_HTTP_PORT, () => {
			console.log("HTTP server is running on port", process.env.EXPRESS_SERVER_HTTP_PORT);
		});

		httpsServer.listen(process.env.EXPRESS_SERVER_HTTPS_PORT, () => {
			console.log("HTTPS server is running on port", process.env.EXPRESS_SERVER_HTTPS_PORT);
		});
	});

// cleanup process
const exit = async (exitCode = 0) => {
	await forecastDb.close();
	console.log('Closed MongoDB connection');
	
	httpServer.close();
	httpsServer.close();
	console.log('Shutting server');
	
	console.log('Exiting');
	process.exitCode = exitCode;
	process.exit();
};

process.on('exit', async () => {
	await exit();
});

process.on('close', async () => {
	await exit();
});

process.on('SIGINT', async () => {
	await exit();
});

process.on('SIGTERM', async () => {
	await exit();
});

process.on('uncaughtException', async error => {
	//console.log('Express server error');
	console.error(error.message);
	await exit(1);
})
import config from './config/index.js';
import path from 'path';

// __dirname is not available is ES modules [https://nodejs.org/api/esm.html#no-__filename-or-__dirname]
// solution from https://github.com/nodejs/help/issues/2907#issuecomment-757446568
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protocols = config.server.BACKEND_SERVER_PROTOCOLS;

// routes and services
import router from './routes/routes.js';
import forecastDatabase from './services/ForecastDatabase/forecastDatabase.js';

// server components
import express from 'express';
import cors from 'cors';
import compression from 'compression';

// middleware
import { timeLog, checkRefetchDisabled } from './middleware/index.js';
import { useTempAPIKey } from './middleware/useTemporaryAPIKey/index.js';

const server = express();
server.set('trust proxy', 'loopback, linklocal, uniquelocal');

// serve frontend build
config.static.SERVE_STATIC && server.use(express.static(config.static.SERVE_STATIC));

// middleware
server.use(timeLog);
server.use(compression());
server.use(cors());
server.use(checkRefetchDisabled);
server.use(useTempAPIKey);

// routing
server.use(config.api.BACKEND_API_ENDPOINT, router);

// http & https servers
let httpServer, httpsServer;

if(protocols.includes('http')) {
	import('http').then(http => {
		httpServer = http.createServer(server);
	})
}

if(protocols.includes('https')) {
	Promise.all(['https', 'fs'].map(m => import(m))).then(([https, fs]) => {
		const privateKey  = fs.readFileSync(path.resolve(path.relative(__dirname, config.ssl.BACKEND_SERVER_PRIVATE_KEY)), 'utf8');
		const certificate = fs.readFileSync(path.resolve(path.relative(__dirname, config.ssl.BACKEND_SERVER_CERTIFICATE)), 'utf8');
		const certificateAuthority = config.ssl.BACKEND_SERVER_CA && fs.readFileSync(path.resolve(path.relative(__dirname, config.ssl.BACKEND_SERVER_CA)), 'utf8');
		const credentials = {
			key: privateKey,
			cert: certificate,
			...config.ssl.BACKEND_SERVER_CA && { ca: certificateAuthority }
		};
		httpsServer = https.createServer(credentials, server);
	});
}

// helper functions
// connect to db up to #retries attempts
const connectDb = async (retries = 5) => {
	try {
		console.log('Connecting to MongoDB server')
		await forecastDatabase.connect();
		console.log('Connected to MongoDB server', config.mongoDB.MONGODB_URI.match(/@.*\//)[0]);
	}
	catch(error) {
		if(retries === 1) {
			console.error('Exiting');
			process.exitCode = 1;
			process.exit();
		}
		console.error(`Failed to connect to MongoDB server at ${config.mongoDB.MONGODB_URI.match(/@.*\//)[0]} [Error: ${error.message}]`);	
		console.log(`Retrying to connect to MongoDB server, remaining attempts: ${retries - 1}`);
		return await connectDb(retries - 1);
	}
}

const disconnectDb = async (retries = 5) => {
	try {
		console.log('Disconnecting from MongoDB server at', config.mongoDB.MONGODB_URI.match(/@.*\//)[0]);
		await forecastDatabase.close();
		console.log('Disconnected from MongoDB server');
	}
	catch(error) {
		if(retries === 1) {
			console.error('Exiting');
			process.exitCode = 1;
			process.exit();
		}
		console.error(`Failed to disconnect from MongoDB server at ${config.mongoDB.MONGODB_URI.match(/@.*\//)[0]} [Error: ${error.message}]`);	
		console.log(`Retrying to discconnect from MongoDB server, remaining attempts: ${retries - 1}`);
		return await disconnectDb(retries - 1);
	}
}

const start = async () => {
// init database connection and server listening ports
	await connectDb();
	if(protocols.includes('http')) {
		httpServer.listen(config.server.BACKEND_SERVER_HTTP_PORT, () => {
			console.log("HTTP server is listening on port", config.server.BACKEND_SERVER_HTTP_PORT);
		});
	}
	if(protocols.includes('https')) {
		httpsServer.listen(config.server.BACKEND_SERVER_HTTPS_PORT, () => {
			console.log("HTTPS server is listening on port", config.server.BACKEND_SERVER_HTTPS_PORT);
		});
	}
}

// exit app gracefully with given code
const exit = async (exitCode = 0) => {
	await disconnectDb();

	console.log('Shutting server(s)');
	httpServer?.listening && httpServer.close() && console.log('Closed HTTP server');
	httpsServer?.listening && httpsServer.close() && console.log('Closed HTTPS server');
	
	console.log('Exiting');
	//process.exitCode = exitCode;
	//process.exit(exitCode);
};

// handle process events
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
	console.log('Uncaught exception');
	console.error(error.message);
	await exit(1);
});

export default {
	httpServer,
	httpsServer,
	exit,
	start
}
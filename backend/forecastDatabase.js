const { MongoClient } = require('mongodb');
 
const dbName = 'weather-forecast';
const collectionName = 'forecasts';
const uri = `mongodb://localhost:${process.env.MONGODB_PORT}`;
const client = new MongoClient(uri, { useUnifiedTopology: true });
let database = null;
let collection = null;


const insertCity = async city => {
	try {
		const result = await collection.updateOne({ lat: Number.parseFloat(city.lat), lon: Number.parseFloat(city.lon) }, { $set: { ...city } }, { upsert: true });
		return result;
	}
	catch(error) {
		throw error;
	}
}

const insertCities = async cities => {
	try {
		const result = await Promise.all( cities.map(async city => insertCity(city)) );
		return result;
	}
	catch(error) {
		throw error;
	}
}

const updateCity = async (lat, lon, data) => {
	try {
		//const found = await collection.findOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
		const result = await collection.updateOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) }, { $set: { ...data } });
		return result;
	}
	catch(error) {
		throw error;
	}
}

const findCity = async (lat, lon) => {
	try {
		const result = await collection.findOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
		return result;
	}
	catch(error) {
		throw error;
	}
}

const allCities = async () => {
	try {
		const result = await collection.find({});
		return result.toArray();
	}
	catch(error) {
		throw error;
	}
}

const removeCity = async (lat, lon) => {
	try {
		const result = await collection.deleteOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
		return result;
	}
	catch(error) {
		throw error;
	}
}

const clearDatabase = async () => {
	try {
		await collection.deleteMany({});
	}
	catch(error) {
		throw error;
	}
}

const connect = async () => {
	try {
		await client.connect();
		database = await client.db(dbName);
		console.log("Connected successfully to MongoDB server on port", process.env.MONGODB_PORT);
		collection = await database.collection(collectionName);
	}
	catch(error) {
		throw error;
	}
}

const close = async () => {
	try {
		await client.close();
		console.log('Database connection closed');
	}
	catch(error) {
		console.log(error.message);
		throw error;
	}
}

module.exports = { 
	insertCity,
	insertCities,
	findCity,
	allCities,
	removeCity,
	updateCity,
	clearDatabase,
	connect,
	close
};
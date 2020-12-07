const { MongoClient } = require('mongodb');
 
const dbName = 'weather-forecast';
const collectionName = 'forecasts';
const uri = `mongodb://localhost:${process.env.MONGODB_PORT}`;
let client = null;
let database = null;
let collection = null;


const insertCity = async city => {
	const result = await collection.updateOne({ lat: Number.parseFloat(city.lat), lon: Number.parseFloat(city.lon) }, { $set: { ...city } }, { upsert: true });
	return result;
}

const insertCities = async cities => {
	const result = await Promise.all( cities.map(async city => insertCity(city)) );
	return result;
}

const updateCity = async (lat, lon, data) => {
	const result = await collection.updateOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) }, { $set: { ...data } });
	return result;
}

const findCity = async (lat, lon) => {
	const result = await collection.findOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
	return result;
}

const allCities = async () => {
	const result = await collection.find({});
	return result.toArray();
}

const removeCity = async (lat, lon) => {
	const result = await collection.deleteOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
	return result;
}

const clearDatabase = async () => {
	await collection.deleteMany({});
}

const connect = async () => {
	client = await MongoClient.connect(uri, { useUnifiedTopology: true });
	database = await client.db(dbName);
	collection = await database.collection(collectionName);
}

const close = async () => {
	if(!client) return;
	
	await client.close();
	client = null;
	database = null;
	collection = null;
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
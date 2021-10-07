const { MongoClient } = require('mongodb');
 
const dbName = 'weather-forecast';
const collectionName = 'forecasts';
const uri = process.env.MONGODB_URI
let client = null;
let database = null;
let collection = null;


/* CRUD operations */

const insertCity = async city => {
// (C)reates city
	const result = await collection.updateOne({ lat: Number.parseFloat(city.lat), lon: Number.parseFloat(city.lon) }, { $set: { ...city } }, { upsert: true });
	if(!result.upsertedCount) {
		throw new Error(`Inserting lat:${city.lat} lon:${city.lon} failed`);
	}
	return result;
}

const findCity = async (lat, lon) => {
// (R)eads city
	const result = await collection.findOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
	if(result == null) {
		throw new Error(`lat: ${lat} lon: ${lon} does not exist`);
	}
	return result;
}

const updateCity = async (lat, lon, data) => {
// (U)pdates city
	const result = await collection.findOneAndUpdate({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) }, { $set: { ...data } });
	if(!result.lastErrorObject.n) {
		throw new Error(`lat: ${lat} lon: ${lon} does not exist`);
	}
	else if(!result.lastErrorObject.updatedExisting) {
		throw new Error(`Updating lat: ${lat} lon: ${lon} failed`);
	}
	return result.value;
}

const removeCity = async (lat, lon) => {
// (D)eletes city
	const result = await collection.deleteOne({ lat: Number.parseFloat(lat), lon: Number.parseFloat(lon) });
	if(result.deletedCount !== 1) {
		throw new Error(`Deleting lat: ${lat} lon: ${lon} failed`);
	}
	return result;
}


/* batch operations */

const insertCities = async cities => {
	const result = await Promise.all(
		cities.map(async city => {
			try {
				return await insertCity(city);
			}
			catch(error) {
			}
		})
	);
	return result;
}


const allCities = async () => {
	const result = await collection.find({});
	return result.toArray();
}


const clearDatabase = async () => {
	await collection.deleteMany({});
}


/* database connection */
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
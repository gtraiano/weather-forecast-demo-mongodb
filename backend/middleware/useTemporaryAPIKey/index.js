// holds temporary api keys (<ip, key> pairs)
const tempKeys = new Map();

// temporary key property name in request object
const TEMP_API_KEY = 'TEMP_API_KEY';

const setTempAPIKey = (ip, key) => {
// set key for ip
// if null is passed, remove pair <ip, key>
// return true/false depending on operation success
    if(key === undefined) return false;
    if(key === null) return removeTempAPIKey(ip);
    const done = tempKeys.set(ip, key) instanceof Map;
    done && console.info('Set temporary OpenWeather API key for', ip, 'to', key);
    return done;
}

const removeTempAPIKey = (ip) => {
// remove key for given ip
// return true/false depending on operation success
    const done = tempKeys.delete(ip);
    done && console.info('Deleted temporary OpenWeather API key for ip', ip);
    return done;
}

const getTempAPIKey = (ip) => tempKeys.get(ip);

const hasTempAPIKey = (ip) => tempKeys.has(ip);

// retrieve api key by request ip
const useTempAPIKey = (req, _res, next) => {
    if(tempKeys.has(req.ip)) {
        // pass it for further use
        req[TEMP_API_KEY] = tempKeys.get(req.ip);
    }
    next();
}

export {
    TEMP_API_KEY,
    setTempAPIKey,
    removeTempAPIKey,
    getTempAPIKey,
    hasTempAPIKey,
    useTempAPIKey
}
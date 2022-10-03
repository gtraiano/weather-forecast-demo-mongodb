// holds temporary api keys (<ip, key> pairs)
const tempKeys = new Map()

// temporary key property name in request object
const TEMP_API_KEY = 'TEMP_API_KEY'

const setTempAPIKey = (ip, key) => {
    tempKeys.set(ip, key)
    console.info('temporary OW API key for', ip, 'set to', key)
}

const removeTempAPIKey = (ip) => {
    tempKeys.delete(ip)
    !tempKeys.has(ip) && console.info('Deleted temporary OW API key for ip', ip)
}

const getTempAPIKey = (ip) => tempKeys.get(ip);

const hasTempAPIKey = (ip) => tempKeys.has(ip);

// retrieve api key by request ip
const useTempAPIKey = (req, _res, next) => {
    if(tempKeys.has(req.ip)) {
        // pass it for further use
        //Object.assign(req, { [TEMP_API_KEY]: tempKeys.get(req.ip) })
        req[TEMP_API_KEY] = tempKeys.get(req.ip);
    }
    next()
}

module.exports = {
    TEMP_API_KEY,
    setTempAPIKey,
    removeTempAPIKey,
    getTempAPIKey,
    hasTempAPIKey,
    useTempAPIKey
}
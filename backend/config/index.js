import dotenv from 'dotenv';

// ENV_PATH may be provided as a command line argument to Node
dotenv.config({ path: process.env.ENV_PATH ?? '../.env' });

// relax strictness for use of self-signed certificate when testing on localhost
if(
    process.env.NODE_ENV === 'test' &&
    /^localhost$|^127\.0\.0\.1$|^(?:0\.){3}0$/i.test(process.env.BACKEND_DOMAIN?.trim())
) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const regEx = {
    acceptableEndpoint: /^(?:\/[\w@]+)*\/?$/gm,
    trailingForwSlash: /(?<=.+)\/$/gm,
    allowSetOWApiKey: /^true$|^false$|^[01]$/i
}

const config = {
    server: {
        BACKEND_DOMAIN: process.env.BACKEND_DOMAIN?.trim() ?? '0.0.0.0',
        BACKEND_SERVER_PROTOCOLS: process.env.BACKEND_SERVER_PROTOCOLS.split(',').map( p => p.trim().toLowerCase() ),
        ...process.env.BACKEND_SERVER_HTTP_PORT && {
            BACKEND_SERVER_HTTP_PORT: Number.parseInt(process.env.BACKEND_SERVER_HTTP_PORT) ?? 3000
        },
        ...process.env.BACKEND_SERVER_HTTPS_PORT && {
            BACKEND_SERVER_HTTPS_PORT: Number.parseInt(process.env.BACKEND_SERVER_HTTPS_PORT) ?? 3001
        },
    },
    
    openWeather: {
        // OpenWeather API key
        OW_API_KEY: process.env.NODE_ENV !== 'test' ? process.env.OW_API_KEY?.trim() : process.env.TEST_OW_API_KEY?.trim(),
        // allow setting API key
        ALLOW_SET_OW_API_KEY: /^true$|^false$|^[01]$/i.test(process.env.ALLOW_SET_OW_API_KEY?.trim())   // valid values are [true|false|0|1] (ignoring case)
            ? /^true$|^false$/i.test(process.env.ALLOW_SET_OW_API_KEY.trim())
                ? Boolean(process.env.ALLOW_SET_OW_API_KEY.trim())                                     // is true|false format
                : Boolean(Number.parseInt(process.env.ALLOW_SET_OW_API_KEY.trim()))                    // is 0|1 format
            : false,                                                                                   // default value if not defined
        // are we using temporary OpenWeather API keys?
        usesTempAPIKey: () => config.openWeather.OW_API_KEY?.length === 0 || config.openWeather.OW_API_KEY === undefined,
        // delay after failed request
        DELAY_AFTER_ERROR: 250,
        // disable refetching of forecast data from OpenWeather API
        DISABLE_REFETCH: Boolean(Number.parseInt(process.env.DISABLE_REFETCH) ?? 0)
    },

    // MongoDB URI
    mongoDB: {
        MONGODB_URI: process.env.NODE_ENV !== 'test' ? process.env.MONGODB_URI?.trim() : process.env.TEST_MONGODB_URI?.trim(),
        DATABASE_NAME: 'weather-forecast',
        COLLECTION_NAME: 'forecasts'
    },
    
    // frontend build path to be served
    static: {
        SERVE_STATIC: process.env.SERVE_STATIC?.trim(),
    },
    
    ssl: {
        // https ssl certificates
        BACKEND_SERVER_PRIVATE_KEY: process.env.BACKEND_SERVER_PRIVATE_KEY?.trim(),
        BACKEND_SERVER_CERTIFICATE: process.env.BACKEND_SERVER_CERTIFICATE?.trim(),
        BACKEND_SERVER_CA: process.env.BACKEND_SERVER_CA?.trim()
    },

    api: {
        BACKEND_API_ENDPOINT: regEx.acceptableEndpoint.test(process.env.BACKEND_API_ENDPOINT?.trim())   // follows /path/path/... pattern with optional trailing forward slash
            ? process.env.BACKEND_API_ENDPOINT.trim().replace(regEx.trailingForwSlash, '')              // replace trailing forward slash
            : '/'                                                                                       // undefined, so mount at /
    }
}

export default config;
const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    hostname: process.env.HOSTNAME || '0.0.0.0',
    mongodb: {
        uri: process.env.MONGO_URI || 
        'mongodb://usr:secure@mongo/test'
        
    },
    secretKey: process.env.SECRET_KEY || '12345678'
}

module.exports = config

// hostname: process.env.HOSTNAME || 'localhost'

// 'mongodb://usr:secure@127.0.0.1:27018/test'
// 'mongodb://usr:secure@mongo/test'
// 'mongodb+srv://admin:357ZNnRMtGwNUYk@cluster0.sokv7.mongodb.net/test'
require('dotenv').config();
const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_DB,
    socket: {
        host: 'redis-18678.crce263.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 18678
    }
});

module.exports = redisClient;
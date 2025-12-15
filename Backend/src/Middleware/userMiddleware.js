
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redisDb.js');

const userMiddleware = async(req ,res, next)=>{

    try {
        const {token} = req.cookies;

        if(!token){
            res.status(404).send("Token is not present");
        }

        const payload = jwt.verify(token, process.env.JWT_KEY);

        const {_id} = payload;
        if(!_id){
            res.status(404).send("Id is missing");
        }

        const result = await User.findById(_id);

        if(!result){
            res.status(404).send("User doesnt exist");
        }

        const isBlocked = await redisClient.exists(`token:${token}`);

        if(isBlocked){
            res.status(404).send("Invalid token");
        }

        req.result = result;

        next();

    } catch (err) {
        res.status(500).send("Error"+err);
    }
}

module.exports = userMiddleware;
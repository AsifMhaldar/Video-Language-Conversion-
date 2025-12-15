
const User = require('../models/user.js');
const userSchema = require('../models/user');
const Validator = require('../Utils/Validator.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisDb.js');


// this is for register the user
const register = async(req, res) =>{

    try {

        Validator(req.body);

        const {firstname, lastname, emailId, password} = req.body;

        req.body.password = await bcrypt.hash(password,10);
        req.body.role = 'user';

        const user = await User.create(req.body);

        const token = jwt.sign({_id:user._id, emailId:emailId, role:'user'}, process.env.JWT_KEY ,{expiresIn:60*60});

        res.cookie('token', token, {maxAge:(60*60*1000)});

        res.status(200).send("User register successfully");


    } catch (err) {
        // console.log(err);
        res.status(500).send("Internal server error");
    }
}

const login = async(req, res)=>{
    try {
        
        const {emailId, password} = req.body;

        if(!emailId){
            res.status(404).send("Invalid email");
        }
        if(!password){
            res.status(404).send("Invalid password");
        }

        const user = await User.findOne({emailId});

        const match = bcrypt.compare(password, user.password);

        if(!match){
            res.status(404).send("Invalid crediantials");
        }

        const token = jwt.sign({_id:user._id, emailId:emailId, role:user.role}, process.env.JWT_KEY ,{expiresIn:60*60});

        res.cookie('token', token, {maxAge:(60*60*1000)});

        res.status(200).send("User Logged In Successfully");
        
    } catch (err) {
        res.status(500).send("Internal Server error", err);
    }
}


const logout = async(req, res)=>{

    try {
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,`Blocked`);
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null, {expires:new Date(Date.now())});
        res.status(200).send("User logout successfully");

    } catch (err) {
        res.status(500).send("Internal Server error",err);
    }
}

// const adminRegister = async(req, res) =>{
//     try {

//         Validator(req.body);

//         const {firstname, lastname, emailId, password} = req.body;

//         req.body.password = await bcrypt.hash(password,10);
//         req.body.role = 'admin';

//         const user = await User.create(req.body);

//         const token = jwt.sign({_id:user._id, emailId:emailId, role:'user'}, process.env.JWT_KEY ,{expiresIn:60*60});

//         res.cookie('token', token, {maxAge:(60*60*1000)});

//         res.status(200).send("User register successfully");


//     } catch (err) {
//         console.log(err);
//         res.status(500).send("Internal server error");
//     }
// }

module.exports = {register, login, logout};
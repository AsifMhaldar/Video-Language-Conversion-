const express = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true,
        minLength:3,
        maxLength:30,
    },
    lastname:{
        type:String,
        minLength:3,
        maxLength:30,
    },
    password:{
        type:String,
        required:true,
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable:true,
    },
    age:{
        type:Number,
        min:6,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    }
},{
    timestamps:true
});


const User = mongoose.model("User", userSchema);

module.exports = User;
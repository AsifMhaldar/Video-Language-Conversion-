const express = require('express');
const userRouter = express.Router();
const {register, login, logout} = require('../Controller/userAuthentication.js');
const userMiddleware = require('../Middleware/userMiddleware.js');



userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.post('/logout',userMiddleware, logout);
// userRouter.post('/admin/register',adminMiddleware , adminRegister);

module.exports = userRouter;
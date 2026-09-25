const express = require('express');
const authRouter = express.Router();
const { register, login, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', authMiddleware, logout);

module.exports = authRouter;

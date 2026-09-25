const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const { validateRegister, validateLogin } = require('../utils/validators');
const { COOKIE_NAME, TOKEN_TTL_SECONDS, COOKIE_MAX_AGE_MS } = require('../constants');

const sanitizeUser = (user) => ({
  id: user._id,
  firstname: user.firstname,
  lastname: user.lastname,
  emailId: user.emailId,
  role: user.role
});

const signToken = (user) =>
  jwt.sign(
    { _id: user._id, emailId: user.emailId, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  );

const register = async (req, res) => {
  validateRegister(req.body);

  const { firstname, lastname, emailId, password } = req.body;

  const existingUser = await User.findOne({ emailId });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstname,
    lastname,
    emailId,
    password: hashedPassword,
    role: 'user'
  });

  const token = signToken(user);

  res.cookie(COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE_MS,
    httpOnly: true,
    sameSite: 'lax'
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user: sanitizeUser(user) }
  });
};

const login = async (req, res) => {
  validateLogin(req.body);

  const { emailId, password } = req.body;

  const user = await User.findOne({ emailId });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user);

  res.cookie(COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE_MS,
    httpOnly: true,
    sameSite: 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'User logged in successfully',
    data: { user: sanitizeUser(user) }
  });
};

const logout = async (req, res) => {
  res.cookie(COOKIE_NAME, null, { expires: new Date(Date.now()) });

  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

module.exports = { register, login, logout };

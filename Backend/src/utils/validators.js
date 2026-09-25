const validator = require('validator');
const ApiError = require('./ApiError');

const validateRegister = (data) => {
  const mandatoryFields = ['firstname', 'lastname', 'emailId', 'password'];
  const missing = mandatoryFields.filter((field) => !data[field]);

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(', ')}`);
  }

  if (!validator.isEmail(data.emailId)) {
    throw new ApiError(400, 'Invalid email address');
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new ApiError(
      400,
      'Weak password. Must be at least 8 characters with uppercase, lowercase, number and symbol'
    );
  }
};

const validateLogin = (data) => {
  if (!data.emailId) {
    throw new ApiError(400, 'Email is required');
  }
  if (!data.password) {
    throw new ApiError(400, 'Password is required');
  }
};

module.exports = { validateRegister, validateLogin };

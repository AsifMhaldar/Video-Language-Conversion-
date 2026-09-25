require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  const mongodbURL = process.env.MONGODB_URI;

  if (!mongodbURL) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB server');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  await mongoose.connect(mongodbURL);

  return mongoose.connection;
};

module.exports = connectDB;

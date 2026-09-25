require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth.routes');
const videoRouter = require('./routes/video.routes');
const conversionRouter = require('./routes/conversion.routes');
const { notFoundHandler, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VideoLang AI API is running',
    endpoints: {
      auth: '/user',
      videos: '/api/videos',
      conversions: '/api/conversions'
    }
  });
});

app.use('/user', authRouter);
app.use('/api/videos', videoRouter);
app.use('/api/conversions', conversionRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

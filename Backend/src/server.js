require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redisClient = require('./config/redisDb');
const app = express();
const db = require('./config/db');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser');
const userRouter = require('./Routes/userRoute');
const videoRouter = require('./Routes/video');
const conversionRouter = require('./Routes/conversion.routes');
const fs = require('fs');
const path = require('path');

// CORS Configuration
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(cookieParser());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads'); // Go up one level from src
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Uploads directory created');
}

app.get("/", (req, res) => {
    res.send("Welcome to Our Hotel");
});

app.use('/user', userRouter);
app.use('/api/videos', videoRouter);
app.use('/api/conversions', conversionRouter);

const InitializeConnection = async() => {
    try {
        await Promise.all([redisClient.connect()]);
        console.log("DB Connected");

        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on ${process.env.PORT} port`);
        });

    } catch (err) {
        console.log("Error", err);
    }
}

InitializeConnection();
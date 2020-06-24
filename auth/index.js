const express = require('express');
const dotenv =require('dotenv');
const mongoose = require('mongoose');

//Import routes
const authRoute = require('./routes/auth'); 

dotenv.config();

const app =express();
// Connect to DB
mongoose.connect( process.env.DB_CONNECT, { useUnifiedTopology: true, useNewUrlParser: true },
    () => {
        return console.log('Connected TO DB!');
    }
);

//Middleware

app.use(express.json());

//Route Middleware

app.use('/api/user', authRoute);


app.listen(3000, () => console.log('server is up and running'));


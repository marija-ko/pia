require('./config/config')
require('./models/db')

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');

const app = express();

const port = 3000;

//Routes

const authRoutes =  require('./routes/auth');
const bookRoutes = require('./routes/books');
const eventRoutes = require('./routes/events')
const userRoutes = require('./routes/users')



// Middleware

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);


app.use("/assets", express.static(path.join("../backend/assets")))

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

//Index Route

var User = require('./models/user.js');
app.get('/', (req, res) => {
  User.find( (err, users) => {
    if (err)
       res.send(err);
    res.json(users); 
 });
});


//Start Server

app.listen(process.env.PORT, () => {
  console.log(`Server started at port http://localhost:${port}`)
});
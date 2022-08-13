require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dairyDB';

mongoose.connect(MONGO_URL, err => {
  !err ? console.log('DB Connection Successful') : log('DB Connection Failed');
});

module.exports = mongoose;

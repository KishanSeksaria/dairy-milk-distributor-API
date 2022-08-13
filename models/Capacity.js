const mongoose = require('../db');

const capcitySchema = mongoose.Schema({
  maxCapacity: {
    type: Number,
    default: 100,
  },
  capacityLeft: {
    type: Number,
    default: 100,
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString(),
  },
});

const Capacity = mongoose.model('Capacity', capcitySchema);

module.exports = Capacity;

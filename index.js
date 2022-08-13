require('dotenv').config();
const express = require('express');
const Capacity = require('./models/capacity');
const Order = require('./models/Order');
const app = express();
const orderRoute = require('./routes/order');
const MAX_CAPACITY_PER_DAY = process.env.MAX_CAPACITY_PER_DAY || 100;

app.use(express.json());
app.use('/api/orders/', orderRoute);

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/api/checkCapacity/:date', async (req, res) => {
  const { date } = req.params;
  try {
    if (!date.includes('-'))
      return res.status(403).json({ message: 'Invalid Date format' });

    // Parsing date to familiar format
    const givenDate = req.params.date.replaceAll('-', '/');

    // finding capacity entry for the given date
    const capacityForGivenDate = await Capacity.findOne({ date: givenDate });

    const capacityLeft = capacityForGivenDate
      ? capacityForGivenDate.capacityLeft
      : MAX_CAPACITY_PER_DAY;

    res.status(200).json({ capacityLeft });
  } catch (err) {
    res.status(500).json(err);
  }
});

app.listen(process.env.PORT || 5000, () => console.log('Server running'));

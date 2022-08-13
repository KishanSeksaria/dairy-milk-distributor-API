const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const acceptedStatus = ['placed', 'packed', 'dispached', 'delivered'];
const Capacity = require('../models/capacity');
const MAX_CAPACITY_PER_DAY = process.env.MAX_CAPACITY_PER_DAY || 100;

// ROUTE 1: GET '/api/orders/' - Get all orders for the date given, returns current date orders by default if no date provided
router.get('/', async (req, res) => {
  const { date } = req.body;
  try {
    // Getting all orders for the provided date, or return orders for current day by default
    const orders = await Order.find({
      orderedOn: date || new Date().toLocaleDateString(),
    });

    // Returning the list of orders found
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTE 2: GET '/api/orders/:id' - Find order with given Id
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    order
      ? res.status(200).json(order)
      : res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTE 3: POST '/api/orders/add' - Add a new order
router.post('/add', async (req, res) => {
  const { order } = req.body;
  try {
    if (!order) return res.status(403).json({ message: 'Bad Request' });

    const { quantity, rate, status } = order;

    if (!quantity || quantity < 0)
      return res
        .status(403)
        .json({ message: 'Enter a valid value for quantity' });

    if (!acceptedStatus.includes(status))
      return res.status(403).json({ message: 'ENter a valid status' });

    if (!rate || rate < 0)
      return res.status(403).json({ message: 'Enter a valid value for rate' });

    let capacityToday = await Capacity.findOne({
      date: new Date().toLocaleDateString(),
    });

    if (!capacityToday)
      capacityToday = await Capacity.create({
        maxCapacity: MAX_CAPACITY_PER_DAY,
        capacityLeft: MAX_CAPACITY_PER_DAY,
      });

    if (capacityToday.capacityLeft < quantity)
      return res.status(403).json({ message: 'Quantity not available' });

    // Create an Order
    const createdOrder = await Order.create(order);

    if (!createdOrder)
      return res.status(500).json({ message: 'Internal Server Error' });

    await capacityToday.updateOne({
      capacityLeft: capacityToday.capacityLeft - quantity,
    });

    // If order created, return the order, else return failed message
    createdOrder
      ? res.status(200).json(createdOrder)
      : res.status(500).json({ message: 'Order Creation failed' });
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTE 4: PUT '/api/orders/update/:id' - Update Order with given Id
router.put('/update/:id', async (req, res) => {
  const { order } = req.body;
  try {
    // If no updates sent
    if (!order) return res.status(403).json({ message: 'Bad Request' });

    const { quantity, rate, status } = order;

    if (quantity && quantity < 0)
      return res
        .status(403)
        .json({ message: 'Enter a valid value for quantity' });

    if (status && !acceptedStatus.includes(status))
      return res.status(403).json({ message: 'Enter a valid status' });

    if (rate && rate < 0)
      return res.status(403).json({ message: 'Enter a valid value for rate' });

    // Finding the order
    const orderToBeUpdated = await Order.findById(req.params.id);

    // If no order found with given id
    if (!orderToBeUpdated)
      return res.status(404).json({ message: 'Order not found' });

    const capacityOfTheDay = await Capacity.findOne({
      date: orderToBeUpdated.orderedOn,
    });

    if (
      capacityOfTheDay.capacityLeft + orderToBeUpdated.quantity - quantity <
      0
    )
      return res.status(403).json({ message: 'Quantity not available' });

    // Updating Order
    const update = await orderToBeUpdated.updateOne(order);

    if (!update.acknowledged)
      return res.status(500).json({ message: 'Internal Server Error' });

    await capacityOfTheDay.updateOne({
      capacityLeft:
        capacityOfTheDay.capacityLeft + orderToBeUpdated.quantity - quantity,
    });

    // Returning the result of updation
    res.json(update);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTE 5: PATCH '/api/orders/updateStatus/:id' - Update the status of order with given id
router.patch('/updateStatus/:id', async (req, res) => {
  const { status } = req.body;
  try {
    // If no updates sent
    if (!status) return res.status(403).json({ message: 'Status not found' });

    // Finding the order
    const orderToBeUpdated = await Order.findById(req.params.id);

    // If no order found with given id
    if (!orderToBeUpdated)
      return res.status(404).json({ message: 'Order not found' });

    // Updating Order
    if (!acceptedStatus.includes(status))
      return res.status(403).json({ message: 'Bad Request' });

    const update = await orderToBeUpdated.updateOne({ status });

    // Returning the result of updation
    res.json(update);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTE 6: DELETE '/api/orders/delete/:id' - Delete order with given id
router.delete('/delete/:id', async (req, res) => {
  try {
    // Searching for the order and deleting it
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    deletedOrder
      ? res.status(200).json({ message: 'Successfully Deleted' })
      : res.status(404).json({ message: 'Order not found' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

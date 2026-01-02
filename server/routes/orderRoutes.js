const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Public route to create an order
router.post('/', orderController.createOrder);

// Public route to update order status (e.g., Paystack callback/frontend update)
router.put('/:id/status', orderController.updateOrderStatus);

// Paystack Webhook route
router.post('/webhook', orderController.handlePaystackWebhook);

// Protected routes for admin
router.get('/', auth, orderController.getOrders);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;

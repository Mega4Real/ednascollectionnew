const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

// Public route to create an order
router.post('/', orderController.createOrder);

// Protected routes for admin
router.get('/', auth, orderController.getOrders);
router.put('/:id/status', auth, orderController.updateOrderStatus);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;

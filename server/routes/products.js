const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/events', productController.subscribeToProducts);
router.get('/:id', productController.getProductById);

// Protected routes (admin only)
router.post('/', auth, productController.createProduct);
router.put('/reorder', auth, productController.reorderProducts);
router.put('/:id', auth, productController.updateProduct);
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;

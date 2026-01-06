const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const auth = require('../middleware/auth');


// Get all discounts (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const discounts = await prisma.discountCode.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(discounts);
    } catch (error) {
        console.error('Error fetching discounts:', error);
        res.status(500).json({ message: 'Error fetching discounts' });
    }
});

// Create a discount (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        const { code, type, value, minQuantity, usageLimit, expiresAt } = req.body;

        // Basic validation
        if (!code || !type || !value) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (type !== 'PERCENTAGE' && type !== 'FIXED') {
            return res.status(400).json({ message: 'Invalid discount type' });
        }

        const existing = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (existing) {
            return res.status(400).json({ message: 'Discount code already exists' });
        }

        const discount = await prisma.discountCode.create({
            data: {
                code: code.toUpperCase(),
                type,
                value: parseFloat(value),
                minQuantity: minQuantity ? parseInt(minQuantity) : 1,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        res.status(201).json(discount);
    } catch (error) {
        console.error('Error creating discount:', error);
        res.status(500).json({ message: 'Error creating discount' });
    }
});

// Validate discount (Public)
router.post('/validate', async (req, res) => {
    try {
        const { code, itemCount } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Code is required' });
        }

        const discount = await prisma.discountCode.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!discount) {
            return res.status(404).json({ message: 'Invalid discount code' });
        }

        if (!discount.isActive) {
            return res.status(400).json({ message: 'Discount code is inactive' });
        }

        if (discount.expiresAt && new Date() > new Date(discount.expiresAt)) {
            return res.status(400).json({ message: 'Discount code has expired' });
        }

        if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
            return res.status(400).json({ message: 'Discount code usage limit exceeded' });
        }

        // Check Minimum Quantity
        if (itemCount && discount.minQuantity > itemCount) {
            return res.status(400).json({
                message: `This code requires a minimum of ${discount.minQuantity} items.`
            });
        }

        res.json({
            valid: true,
            type: discount.type,
            value: discount.value,
            code: discount.code,
            minQuantity: discount.minQuantity
        });

    } catch (error) {
        console.error('Error validating discount:', error);
        res.status(500).json({ message: 'Error validating discount' });
    }
});

// Delete/Toggle discount (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.discountCode.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting discount' });
    }
});

// Toggle Active Status
router.put('/:id/toggle', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const discount = await prisma.discountCode.findUnique({ where: { id: parseInt(id) } });

        if (!discount) return res.status(404).json({ message: 'Discount not found' });

        const updated = await prisma.discountCode.update({
            where: { id: parseInt(id) },
            data: { isActive: !discount.isActive }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error updating discount' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

// Get banner (Public)
router.get('/banner', async (req, res) => {
    try {
        const setting = await prisma.siteSettings.findUnique({
            where: { key: 'banner_message' }
        });

        res.json({
            message: setting?.value || 'Welcome to Erdnas Collections | Free Delivery For 2 or More Dresses | Shop Now For Affordable Prices'
        });
    } catch (error) {
        console.error('Error fetching banner:', error);
        res.status(500).json({ message: 'Error fetching banner', error: error.message });
    }
});

// Update banner (Admin only)
router.put('/banner', auth, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'Banner message is required' });
        }

        const setting = await prisma.siteSettings.upsert({
            where: { key: 'banner_message' },
            update: { value: message.trim() },
            create: { key: 'banner_message', value: message.trim() }
        });

        res.json({ success: true, message: setting.value });
    } catch (error) {
        console.error('Error updating banner:', error);
        res.status(500).json({ message: 'Error updating banner', error: error.message });
    }
});

module.exports = router;

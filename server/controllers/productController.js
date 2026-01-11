const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Manage active SSE clients
const MAX_CLIENTS = 1000;
const clients = new Set();

exports.subscribeToProducts = (req, res) => {
    if (clients.size >= MAX_CLIENTS) {
        return res.status(503).json({ error: 'Too many connections' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send heartbeat every 30s to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(': heartbeat\n\n');
    }, 30000);

    clients.add(res);

    req.on('close', () => {
        clearInterval(heartbeat);
        clients.delete(res);
    });
};

const notifyProductUpdate = () => {
    clients.forEach(res => res.write('data: refresh\n\n'));
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { position: 'asc' }
        });

        // Cache for 1 minute
        res.set('Cache-Control', 'public, max-age=60');
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { imageUrl, videoUrl, price, sizes } = req.body;

        // Get current max position to append new product at the end
        const maxPosition = await prisma.product.aggregate({
            _max: { position: true }
        });
        const nextPosition = (maxPosition._max.position || 0) + 1;

        const productData = {
            imageUrl,
            videoUrl,
            price: parseFloat(price),
            sizes,
            position: nextPosition,
            isSold: req.body.isSold || false
        };

        const product = await prisma.product.create({
            data: productData
        });

        notifyProductUpdate();
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { imageUrl, videoUrl, price, sizes } = req.body;

        const product = await prisma.product.update({
            where: { id: parseInt(id) },
            data: {
                imageUrl,
                videoUrl,
                price: parseFloat(price),
                sizes,
                isSold: req.body.isSold
            }
        });

        notifyProductUpdate();
        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        notifyProductUpdate();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.reorderProducts = async (req, res) => {
    try {
        const { products } = req.body; // Array of { id, position }

        // Use transaction to update all positions
        await prisma.$transaction(
            products.map(p =>
                prisma.product.update({
                    where: { id: p.id },
                    data: { position: p.position }
                })
            )
        );

        notifyProductUpdate();
        res.json({ message: 'Products reordered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

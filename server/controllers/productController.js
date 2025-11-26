const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { position: 'asc' }
        });
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
        const { id, imageUrl, videoUrl, price, sizes } = req.body;

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
            position: nextPosition
        };

        if (id) {
            productData.id = parseInt(id);
        }

        const product = await prisma.product.create({
            data: productData
        });

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
                sizes
            }
        });

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

        res.json({ message: 'Products reordered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

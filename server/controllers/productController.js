const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' }
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
        const { imageUrl, videoUrl, price, sizes } = req.body;

        const product = await prisma.product.create({
            data: {
                imageUrl,
                videoUrl,
                price: parseFloat(price),
                sizes
            }
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

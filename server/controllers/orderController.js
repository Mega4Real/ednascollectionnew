const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
    try {
        const {
            customerName,
            email,
            phone,
            address,
            city,
            totalAmount,
            paymentMethod,
            paymentReference,
            items
        } = req.body;

        // items should be an array of { productId, size, price }
        const order = await prisma.order.create({
            data: {
                customerName,
                email,
                phone,
                address,
                city,
                // Ensure totalAmount is a Float/Decimal
                totalAmount: parseFloat(totalAmount),
                paymentMethod,
                paymentReference,
                status: 'PENDING',
                items: {
                    create: items.map(item => ({
                        // Ensure productId is an Integer
                        productId: parseInt(item.productId),
                        size: item.selectedSize || item.size,
                        price: parseFloat(item.price)
                    }))
                }
            },
            include: {
                items: true
            }
        });

        // Auto-mark products as sold if payment was successful via Paystack
        if (paymentMethod === 'PAYSTACK' && order.status === 'PAID') {
            // Get all product IDs from the order items
            const productIds = items.map(item => item.productId);

            // Mark all products in this order as sold
            await prisma.product.updateMany({
                where: {
                    id: {
                        in: productIds
                    }
                },
                data: {
                    isSold: true
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error.message
        });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentReference } = req.body;

        const order = await prisma.order.update({
            where: { id: parseInt(id) }, // Ensure this is parsed!
            data: {
                status,
                ...(paymentReference && { paymentReference })
            },
            include: {
                items: true
            }
        });

        // Auto-mark products as sold if status is updated to PAID
        if (status === 'PAID') {
            const productIds = order.items.map(item => item.productId);
            await prisma.product.updateMany({
                where: { id: { in: productIds } },
                data: { isSold: true }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            order
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the order first to check its status
        const order = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Delete order items first due to foreign key constraints if not set to cascade
        // Actually Prisma handles it if specified, but manual delete is safer if not sure.
        await prisma.orderItem.deleteMany({
            where: { orderId: parseInt(id) }
        });

        await prisma.order.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete order',
            error: error.message
        });
    }
};

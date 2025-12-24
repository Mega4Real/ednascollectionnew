const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOrderNotification = async (order) => {
    try {
        const adminEmailStr = process.env.ADMIN_EMAIL || '';
        const recipients = adminEmailStr.split(',').map(e => e.trim()).filter(e => e);

        if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_your_api_key_here') {
            console.warn('Resend API Key not configured correctly. Skipping email notification.');
            return;
        }

        if (recipients.length === 0) {
            console.warn('No admin email recipients configured. Skipping.');
            return;
        }

        const itemsList = order.items.map(item =>
            `<li>Product ID: ${item.productId} - Size: ${item.size} - Price: GHS ${item.price}</li>`
        ).join('');

        const { data, error } = await resend.emails.send({
            from: 'Ednas Collection <onboarding@resend.dev>', // Default Resend domain unless verified
            to: recipients,
            subject: `New Order Received - Order #${order.id}`,
            html: `
                <h1>New Order Alert!</h1>
                <p><strong>Customer:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Phone:</strong> ${order.phone}</p>
                <p><strong>Address:</strong> ${order.address}, ${order.city}</p>
                <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
                <p><strong>Total Amount:</strong> GHS ${order.totalAmount}</p>
                
                <h3>Items:</h3>
                <ul>
                    ${itemsList}
                </ul>
                
                <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/dashboard">View in Admin Dashboard</a></p>
            `,
        });

        if (error) {
            console.error('Error sending email via Resend:', error);
            return;
        }

        console.log('Order notification email sent successfully:', data);
    } catch (error) {
        console.error('Unexpected error in sendOrderNotification:', error);
    }
};

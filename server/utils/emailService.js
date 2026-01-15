const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an order receipt email
 * @param {Object} order - The order object including items and customer details
 */
exports.sendOrderReceipt = async (order) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Email receipt skipped.');
        return;
    }

    const itemsList = order.items.map(item =>
        `<tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f9f9f9;">
                <img src="${item.product && item.product.imageUrl ? item.product.imageUrl : ''}" alt="Product" style="width: 50px; height: 60px; border-radius: 4px; object-fit: cover; text-decoration: none; display: block;" />
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #f9f9f9;">
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                    Size: ${item.size}
                </p>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f9f9f9; text-align: right; white-space: nowrap;">
                <p style="margin: 0; font-weight: bold; font-size: 14px; color: #333;">
                    GH₵${item.price.toLocaleString()}
                </p>
            </td>
        </tr>`
    ).join('');

    const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Order Receipt</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #ffffff;">
            <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff;">
                
                <!-- ENTITY HEADER -->
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; letter-spacing: 2px; font-family: 'Brush Script MT', cursive; color: #ff69b4; fontSize: 28px; font-weight: normal;">
                        Erdnas Collections
                    </h2>
                    <p style="font-size: 12px; color: #666; margin-top: 5px;">
                        Order Receipt #${order.paymentReference || order.id}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        <strong>Payment:</strong> ${order.paymentMethod === 'WHATSAPP' ? 'WhatsApp / Manual' : 'Online (Paystack)'}
                    </p>
                </div>

                <!-- CUSTOMER DETAILS -->
                <div style="margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 4px; font-size: 14px; color: #333;">
                    <p style="margin: 0 0 5px 0;"><strong>Customer:</strong> ${order.customerName}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Phone:</strong> ${order.phone}</p>
                    <p style="margin: 0;"><strong>Address:</strong> ${order.address}, ${order.city}</p>
                </div>

                <!-- ITEMS HEADER -->
                <div style="border-top: 1px solid #eee; padding-top: 15px;">
                    <h4 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Items</h4>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        ${itemsList}
                    </table>
                </div>

                <!-- TOTAL -->
                <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #333; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; font-size: 18px; color: #333; float: left;">Total: </h3>
                    <h3 style="margin: 0; font-size: 18px; color: #333; float: right;">GH₵${order.totalAmount.toLocaleString()}</h3>
                    <div style="clear: both;"></div>
                </div>

                <!-- FOOTER -->
                <p style="font-size: 10px; margin-top: 20px; text-align: center; color: #999; text-transform: uppercase;">
                    Thank you for shopping with Erdnas Collections
                </p>

            </div>
        </body>
        </html>
    `;

    try {
        const data = await resend.emails.send({
            from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
            to: order.email,
            subject: `Order Receipt #${order.paymentReference || order.id} - Erdnas Collections`,
            html: emailHtml,
        });

        console.log(`Email sent successfully to ${order.email}`, data);
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw error to avoid failing the entire request if email fails
        return null;
    }
};

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
                <img 
                    src="${item.product && item.product.imageUrl ? item.product.imageUrl : 'https://erdnascollections.com/android-chrome-192x192.png'}" 
                    alt="${item.product ? item.product.name : 'Product'}" 
                    style="width: 50px; height: 60px; border-radius: 4px; object-fit: cover; display: block;" 
                />
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #f9f9f9;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                    Size: ${item.size}
                </p>
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f9f9f9; text-align: right; white-space: nowrap;">
                <p style="margin: 0; font-weight: bold; font-size: 14px; color: #333;">
                    GH₵${Number(item.price || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </td>
        </tr>`
    ).join('');

    const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Receipt - Erdnas Collections</title>
            <style>
                @font-face {
                    font-family: 'Amsterdam One';
                    src: url('https://erdnascollections.com/fonts/AmsterdamOne-eZ12l.ttf') format('truetype');
                    font-weight: normal;
                    font-style: normal;
                }
            </style>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            
                            <!-- HEADER WITH LOGO/BRAND -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #ff69b4 0%, #ff1493 100%); padding: 30px 20px; text-align: center;">
                                    <h1 style="margin: 0; letter-spacing: 3px; font-family: 'Amsterdam One', cursive; color: #ffffff; font-size: 32px; font-weight: normal; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                                        Erdnas Collections
                                    </h1>
                                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #ffffff; opacity: 0.9;">
                                        ✨ Your Authentic Dress Plug ✨
                                    </p>
                                </td>
                            </tr>

                            <!-- ORDER CONFIRMATION MESSAGE -->
                            <tr>
                                <td style="padding: 30px 20px 20px 20px; text-align: center;">
                                    <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #333;">
                                        Thank You for Your Order! 🎉
                                    </h2>
                                    <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                                        We've received your order and will process it shortly.
                                    </p>
                                </td>
                            </tr>

                            <!-- ORDER DETAILS -->
                            <tr>
                                <td style="padding: 0 20px 20px 20px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <p style="margin: 0; font-size: 13px; color: #666;">
                                                    <strong style="color: #333;">Order Number:</strong> #${order.paymentReference || order.id}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <p style="margin: 0; font-size: 13px; color: #666;">
                                                    <strong style="color: #333;">Payment Method:</strong> ${order.paymentMethod === 'WHATSAPP' ? 'WhatsApp / Manual' : 'Online (Paystack)'}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 5px 0;">
                                                <p style="margin: 0; font-size: 13px; color: #666;">
                                                    <strong style="color: #333;">Order Date:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- CUSTOMER DETAILS -->
                            <tr>
                                <td style="padding: 0 20px 20px 20px;">
                                    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #333;">Delivery Information</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 15px;">
                                        <tr>
                                            <td>
                                                <p style="margin: 0 0 5px 0; font-size: 14px; color: #333;">
                                                    <strong>${order.customerName}</strong>
                                                </p>
                                                <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">
                                                    📞 ${order.phone}
                                                </p>
                                                <p style="margin: 0; font-size: 13px; color: #666;">
                                                    📍 ${order.address}, ${order.city}
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- ITEMS ORDERED -->
                            <tr>
                                <td style="padding: 0 20px 20px 20px;">
                                    <h3 style="margin: 0 0 15px 0; font-size: 16px; color: #333;">Order Items</h3>
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden;">
                                        ${itemsList}
                                    </table>
                                </td>
                            </tr>

                            <!-- TOTAL -->
                            <tr>
                                <td style="padding: 0 20px 30px 20px;">
                                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top: 2px solid #ff69b4; padding-top: 15px;">
                                        <tr>
                                            <td style="text-align: left;">
                                                <h3 style="margin: 0; font-size: 18px; color: #333;">Total Amount</h3>
                                            </td>
                                            <td style="text-align: right;">
                                                <h3 style="margin: 0; font-size: 22px; color: #ff69b4; font-weight: bold;">
                                                    GH₵${order.totalAmount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </h3>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>

                            <!-- FOOTER -->
                            <tr>
                                <td style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #333; font-weight: 600;">
                                        Need Help?
                                    </p>
                                    <p style="margin: 0 0 5px 0; font-size: 13px; color: #666;">
                                        📧 support@erdnascollections.com
                                    </p>
                                    <p style="margin: 0 0 15px 0; font-size: 13px; color: #666;">
                                        📱 WhatsApp: <a href="https://wa.me/233274883478" style="color: #666; text-decoration: none;">+233 27 488 3478</a>
                                    </p>
                                    <p style="margin: 0; font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 1px;">
                                        © ${new Date().getFullYear()} Erdnas Collections. All rights reserved.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
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

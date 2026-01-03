import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePaystackPayment } from 'react-paystack';

const ReceiptTemplate = ({ orderId, items, total, customer, paymentMethod }) => (
    <div id="printable-receipt" style={{
        display: 'none',
        padding: window.innerWidth <= 480 ? '20px' : window.innerWidth <= 768 ? '25px' : '30px',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        color: '#333',
        maxWidth: window.innerWidth <= 480 ? '100%' : window.innerWidth <= 768 ? '400px' : '500px',
        margin: '0 auto',
        width: window.innerWidth <= 480 ? '100%' : 'auto',
        boxSizing: 'border-box'
    }}>
        <div style={{ textAlign: 'center', marginBottom: window.innerWidth <= 480 ? '15px' : '20px' }}>
            <h2 style={{
                margin: '0',
                letterSpacing: '2px',
                fontFamily: "'Amsterdam One', 'Brush Script MT', cursive",
                color: '#ff69b4',
                fontSize: window.innerWidth <= 480 ? '1.5rem' : window.innerWidth <= 768 ? '1.8rem' : '2rem',
                fontWeight: 'normal'
            }}>Erdnas Collections</h2>
            <p style={{
                fontSize: window.innerWidth <= 480 ? '11px' : '12px',
                color: '#666',
                marginTop: '5px'
            }}>Order Receipt #{orderId}</p>
            <p style={{
                margin: '5px 0 0 0',
                fontSize: window.innerWidth <= 480 ? '11px' : '12px',
                color: '#666'
            }}>
                <strong>Payment:</strong> {paymentMethod === 'WHATSAPP' ? 'WhatsApp / Manual' : 'Online (Paystack)'}
            </p>
        </div>

        {customer && (
            <div style={{
                marginBottom: window.innerWidth <= 480 ? '15px' : '20px',
                padding: window.innerWidth <= 480 ? '8px' : '10px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                fontSize: window.innerWidth <= 480 ? '13px' : '14px'
            }}>
                <p style={{ margin: '0 0 5px 0' }}><strong>Customer:</strong> {customer.name}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>Phone:</strong> {customer.phone}</p>
                <p style={{ margin: '0' }}><strong>Address:</strong> {customer.address}, {customer.city}</p>
            </div>
        )}

        <div style={{
            borderTop: '1px solid #eee',
            paddingTop: window.innerWidth <= 480 ? '12px' : '15px'
        }}>
            <h4 style={{
                margin: '0 0 15px 0',
                fontSize: window.innerWidth <= 480 ? '14px' : '16px'
            }}>Items</h4>

            {items.map((item, index) => (
                <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: window.innerWidth <= 480 ? '8px 0' : '10px 0',
                    borderBottom: '1px solid #f9f9f9',
                    flexWrap: window.innerWidth <= 480 ? 'wrap' : 'nowrap',
                    gap: window.innerWidth <= 480 ? '10px' : '15px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: window.innerWidth <= 480 ? '10px' : '15px',
                        flex: window.innerWidth <= 480 ? '1 1 100%' : 'auto'
                    }}>
                        <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            style={{
                                width: window.innerWidth <= 480 ? '40px' : '50px',
                                height: window.innerWidth <= 480 ? '48px' : '60px',
                                borderRadius: '4px',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{ flex: 1 }}>
                            <p style={{
                                margin: '0',
                                fontWeight: 'bold',
                                fontSize: window.innerWidth <= 480 ? '12px' : '14px'
                            }}>
                                Product ID: {item.id}
                            </p>
                            <p style={{
                                margin: '0',
                                fontSize: window.innerWidth <= 480 ? '11px' : '12px',
                                color: '#666'
                            }}>
                                Size: {item.selectedSize}
                            </p>
                        </div>
                    </div>
                    <p style={{
                        margin: '0',
                        fontWeight: 'bold',
                        fontSize: window.innerWidth <= 480 ? '13px' : '14px',
                        flexShrink: 0
                    }}>
                        ₵{item.price.toFixed(2)}
                    </p>
                </div>
            ))}
        </div>

        <div style={{
            marginTop: window.innerWidth <= 480 ? '15px' : '20px',
            paddingTop: window.innerWidth <= 480 ? '12px' : '15px',
            borderTop: '2px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <h3 style={{
                margin: '0',
                fontSize: window.innerWidth <= 480 ? '16px' : '18px'
            }}>Total</h3>
            <h3 style={{
                margin: '0',
                fontSize: window.innerWidth <= 480 ? '16px' : '18px'
            }}>₵{total.toFixed(2)}</h3>
        </div>

        <p style={{
            fontSize: window.innerWidth <= 480 ? '9px' : '10px',
            marginTop: window.innerWidth <= 480 ? '30px' : '40px',
            textAlign: 'center',
            color: '#999',
            textTransform: 'uppercase'
        }}>
            Thank you for shopping with Erdnas Collections
        </p>
    </div>
);

const FloatingCart = ({ selectedItems, onRemoveItem, onClearCart }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: ''
    });
    const [successOrder, setSuccessOrder] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [loadedImages, setLoadedImages] = useState(new Set());
    const [imageLoadingStates, setImageLoadingStates] = useState(new Map());

    // Preload images when items are added to cart
    const preloadImage = useCallback((src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                setLoadedImages(prev => new Set([...prev, src]));
                resolve(src);
            };
            img.onerror = reject;
            img.src = src;
        });
    }, []);

    // Preload all cart item images
    useEffect(() => {
        const imageUrls = selectedItems.map(item => item.imageUrl || item.image).filter(Boolean);
        const uniqueUrls = [...new Set(imageUrls)];

        uniqueUrls.forEach(url => {
            if (!loadedImages.has(url)) {
                preloadImage(url).catch(err => {
                    console.warn('Failed to preload image:', url, err);
                });
            }
        });
    }, [selectedItems, loadedImages, preloadImage]);

    const formRef = useRef(null);
    const cartPopupRef = useRef(null);
    const pendingOrderId = useRef(null);

    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateOrder = async (extraData = {}) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const orderData = {
                customerName: formData.name,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                totalAmount: total,
                paymentMethod: extraData.paymentMethod || 'WHATSAPP',
                paymentReference: extraData.paymentReference || null,
                items: selectedItems.map(item => ({
                    productId: item.id,
                    selectedSize: item.selectedSize,
                    price: item.price
                }))
            };

            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) throw new Error('Failed to save order');
            return await response.json();
        } catch (error) {
            console.error('Error saving order:', error);
            // Even if backend fails, we might still want to proceed with WhatsApp or alert the user
        }
    };

    const updateOrderStatusOnServer = async (orderId, status, paymentReference = null) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, paymentReference })
            });
            if (!response.ok) throw new Error('Failed to update order status');
            return await response.json();
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const handlePaystackSuccessAction = (reference) => {
        const orderId = pendingOrderId.current;

        // 1. Update UI state FIRST
        setSuccessOrder({
            id: reference.reference, // Use the professional reference string from Paystack
            items: [...selectedItems],
            total: total,
            customer: { ...formData },
            paymentMethod: 'PAYSTACK'
        });

        // 2. Then clear the items
        if (typeof onClearCart === 'function') {
            onClearCart();
        }

        // 3. Then do background tasks
        if (orderId) {
            updateOrderStatusOnServer(orderId, 'PAID', reference.reference);
        }

        // Clear product cache so SOLD badge appears immediately
        localStorage.removeItem('cachedProducts');
    };

    const handlePaystackCloseAction = () => {
        const orderId = pendingOrderId.current;
        console.log('PAYSTACK: Modal closed for order:', orderId);
        if (orderId) {
            updateOrderStatusOnServer(orderId, 'CANCELLED')
                .catch(err => console.error("PAYSTACK: Failed to update status on close:", err));
        }
    };

    const componentProps = {
        email: formData.email || 'customer@example.com',
        amount: Math.round(total * 100),
        publicKey,
        currency: "GHS",
        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: formData.name
                },
                {
                    display_name: "Phone Number",
                    variable_name: "customer_phone",
                    value: formData.phone
                }
            ]
        },
        onSuccess: handlePaystackSuccessAction,
        onClose: handlePaystackCloseAction
    };

    const handlePrintReceipt = () => {
        const printContent = document.getElementById('printable-receipt');
        if (!printContent) return;

        const WinPrint = window.open('', '', 'width=900,height=650');

        WinPrint.document.write(`
            <html>
                <head>
                    <title>Order Receipt</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: sans-serif; }
                        img { max-width: 100%; }
                    </style>
                </head>
                <body>
                    <div style="display: block !important;">
                        ${printContent.innerHTML}
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
            </html>
        `);
        WinPrint.document.close();
    };

    const initializePayment = usePaystackPayment(componentProps);

    const generateReference = () => {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, ''); // e.g., 20240102
        const random = Math.random().toString(36).substring(2, 7).toUpperCase(); // e.g., 5X9RT
        return `ERDNA-${date}-${random}`;
    };

    const handlePaystackButtonClick = async (e) => {
        if (e) e.preventDefault();
        if (isProcessing) return;

        if (formRef.current && formRef.current.reportValidity()) {
            setIsProcessing(true);
            try {
                // 1. Generate the professional unique reference FIRST
                const customReference = generateReference();

                // 2. Create the order on your backend with the custom reference
                const orderRes = await handleCreateOrder({
                    paymentMethod: 'PAYSTACK',
                    paymentReference: customReference
                });

                if (orderRes && orderRes.order) {
                    // 3. Store the ID in the ref so the success handler can find it
                    pendingOrderId.current = orderRes.order.id;

                    // 4. Trigger the Paystack popup with the SAME professional reference
                    const paystackConfig = {
                        ...componentProps,
                        reference: customReference,
                    };

                    console.log("Paystack Config with Professional Reference:", paystackConfig);
                    initializePayment(paystackConfig);
                } else {
                    alert("Order creation failed on server.");
                }
            } catch (error) {
                console.error("Payment initiation failed:", error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    // Helper to optimize the Cloudinary URL for images
    const getOptimizedImageUrl = (url) => {
        if (!url) return '';
        // Check if it's a Cloudinary URL
        if (url.includes('cloudinary.com')) {
            // Insert transformation parameters: w_500 (width 500px), q_auto (auto quality), f_auto (auto format)
            // This assumes standard Cloudinary URL structure: .../upload/v12345/...
            return url.replace('/upload/', '/upload/w_500,q_auto,f_auto/');
        }
        return url;
    };

    const handleSendToWhatsApp = async (e) => {
        if (e) e.preventDefault();
        if (isProcessing) return;

        if (formRef.current && !formRef.current.reportValidity()) {
            return;
        }

        setIsProcessing(true);
        try {
            const customReference = generateReference();
            const orderRes = await handleCreateOrder({
                paymentMethod: 'WHATSAPP',
                paymentReference: customReference
            });

            const baseUrl = window.location.origin;
            let message = `*NEW ORDER - ERDNAS COLLECTIONS*\n\n`;
            message += `*Order Ref: ${customReference}*\n`;
            message += `*Customer Details:*\n`;
            message += `Name: ${formData.name}\n`;
            message += `Phone: ${formData.phone}\n`;
            message += `Address: ${formData.address}, ${formData.city}\n\n`;
            message += `*Items:*\n`;

            selectedItems.forEach(item => {
                const imageUrl = item.imageUrl || item.image;
                const optimizedImageUrl = getOptimizedImageUrl(imageUrl);
                const fullImageUrl = optimizedImageUrl.startsWith('http') ? optimizedImageUrl : `${baseUrl}/${optimizedImageUrl}`;

                message += ` View: ${fullImageUrl}\n`;
                message += ` Size: ${item.selectedSize}\n`;
                message += `💰 Price: ₵${item.price.toFixed(2)}\n`;
                message += `-------------------------\n\n`;
            });

            message += `Total: ₵${total.toFixed(2)}`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappNumber = "+233274883478";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            const deepLinkUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodedMessage}`;
            // Show success screen with receipt option
            if (orderRes && orderRes.order) {
                setSuccessOrder({
                    id: customReference,
                    items: [...selectedItems],
                    total: total,
                    customer: { ...formData },
                    paymentMethod: 'WHATSAPP'
                });
            }

            // Clear cart
            if (onClearCart) onClearCart();

            // Redirect to WhatsApp - Try opening in a new tab first
            // 2. Detect device
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (isMobile) {
                // 3. For Mobile: Use the direct protocol to skip the browser 'Open app' page
                window.location.href = deepLinkUrl;
            } else {
                // 4. For Desktop: Use standard URL in a new tab
                window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            }

            // If the browser blocked the popup (returns null), fallback to current tab
            if (!newWindow) {
                setTimeout(() => {
                    window.location.href = whatsappUrl;
                }, 100);
            }
        } catch (error) {
            console.error("WhatsApp redirection failed:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (successOrder) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [successOrder]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartPopupRef.current && !cartPopupRef.current.contains(event.target) && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Lock body scroll when cart is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '50px' }
        );

        const targetSection = document.querySelector('.social-links');
        if (targetSection) {
            observer.observe(targetSection);
        }

        return () => {
            if (targetSection) observer.unobserve(targetSection);
        };
    }, []);

    // Close cart when the last item is removed
    useEffect(() => {
        if (selectedItems.length === 0 && isOpen) {
            setIsOpen(false);
        }
    }, [selectedItems.length, isOpen]);

    // ONLY return null if the cart is COMPLETELY empty AND not open AND not showing success
    if (selectedItems.length === 0 && !successOrder && !isOpen) {
        return null;
    }

    return (
        <div className="floating-cart-wrapper">
            {/* Round Toggle Button (FAB) - Only show if items are selected, cart is closed, and not near footer */}
            {selectedItems.length > 0 && !isOpen && isVisible && (
                <button
                    className="cart-fab"
                    onClick={() => setIsOpen(true)}
                    aria-label="Open Cart"
                >
                    <div className="cart-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </div>
                    <span className="cart-badge">{selectedItems.length}</span>
                </button>
            )}

            {isOpen && (
                <div className="cart-popup-overlay" onClick={() => setIsOpen(false)}>
                    <div className="cart-popup-new" ref={cartPopupRef} onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header-new">
                            <h3>{successOrder ? 'Order Confirmed' : (step === 'cart' ? 'Your Cart' : 'Checkout')}</h3>
                            <button className="close-cart-new" onClick={() => {
                                setIsOpen(false);
                                setStep('cart');
                                setSuccessOrder(null);
                            }}>×</button>
                        </div>

                        {successOrder ? (
                            <div className="success-screen">
                                <div className="success-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h2>{successOrder.paymentMethod === 'PAYSTACK' ? 'Payment Successful!' : 'Order Received!'}</h2>
                                <p className="order-number">Order Reference: <strong>#{successOrder.id}</strong></p>
                                <div className="thank-you-message">
                                    <p>Thank you for your {successOrder.paymentMethod === 'PAYSTACK' ? 'purchase' : 'order'}!</p>
                                    <p>Your order has been received and we will contact you shortly to coordinate delivery.</p>
                                </div>

                                <button className="print-receipt-button" onClick={handlePrintReceipt} style={{
                                    width: '100%',
                                    padding: '12px',
                                    marginTop: '10px',
                                    background: '#fff',
                                    color: '#ff69b4',
                                    border: '1px solid #ff69b4',
                                    borderRadius: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                        <rect x="6" y="14" width="12" height="8"></rect>
                                    </svg>
                                    PRINT RECEIPT
                                </button>

                                <button className="continue-shopping" onClick={() => {
                                    setSuccessOrder(null);
                                    setIsOpen(false);
                                    setStep('cart');
                                }}>
                                    DONE
                                </button>
                            </div>
                        ) : step === 'cart' ? (
                            <>
                                <div className="selected-items-new">
                                    {selectedItems.map(item => (
                                        <div key={`${item.id}-${item.selectedSize}`} className="cart-item-card">
                                            <div className={`item-image-container ${!loadedImages.has(item.imageUrl || item.image) ? 'loading' : ''}`}>
                                                {!loadedImages.has(item.imageUrl || item.image) && (
                                                    <div className="image-loading-spinner"></div>
                                                )}
                                                <img
                                                    src={item.imageUrl || item.image}
                                                    alt={item.name}
                                                    className={loadedImages.has(item.imageUrl || item.image) ? 'loaded' : ''}
                                                    onLoad={() => {
                                                        setLoadedImages(prev => new Set([...prev, item.imageUrl || item.image]));
                                                    }}
                                                    onError={() => {
                                                        // Handle error by showing a placeholder or fallback
                                                        setLoadedImages(prev => new Set([...prev, item.imageUrl || item.image]));
                                                    }}
                                                />
                                            </div>
                                            <div className="item-info-new">
                                                <span className="item-size-label">Size: {item.selectedSize}</span>
                                                <span className="item-price-new">GH₵{item.price.toFixed(2)}</span>
                                            </div>
                                            <button
                                                className="remove-item-new"
                                                onClick={() => onRemoveItem(item.id)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="cart-summary-new">
                                    <div className="total-line-new">
                                        <strong>Total</strong>
                                        <strong>GH₵{total.toFixed(2)}</strong>
                                    </div>

                                    <button
                                        className="checkout-button-new"
                                        onClick={() => setStep('checkout')}
                                        style={{ background: '#000' }}
                                    >
                                        PROCEED TO CHECKOUT
                                    </button>

                                    <button className="continue-shopping" onClick={() => setIsOpen(false)}>
                                        Continue Shopping
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="delivery-form-container">
                                <form ref={formRef} className="delivery-form" onSubmit={(e) => e.preventDefault()}>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Your Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="024 XXX XXXX"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Delivery Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="House No / Street / Landmark"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>City / Area</label>
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="Accra, Kumasi, etc."
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </form>

                                <div className="cart-summary-new">
                                    <div className="total-line-new">
                                        <strong>Total</strong>
                                        <strong>GH₵{total.toFixed(2)}</strong>
                                    </div>

                                    <button
                                        className="whatsapp-button-new"
                                        onClick={handleSendToWhatsApp}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            style={{ marginRight: '8px', verticalAlign: 'middle' }}
                                        >
                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.589.943 3.385 1.44 5.216 1.441 5.399 0 9.794-4.395 9.797-9.796.002-2.618-1.017-5.078-2.868-6.931-1.851-1.854-4.312-2.873-6.93-2.875-5.398 0-9.793 4.396-9.797 9.797-.001 1.83.479 3.618 1.391 5.187l-.893 3.266 3.344-.876.538-.303zm10.516-5.835c-.289-.145-1.713-.847-1.978-.942-.266-.096-.459-.145-.653.145-.193.291-.748.944-.917 1.138-.17.19-.339.213-.628.068-.289-.145-1.22-.449-2.325-1.434-.86-.766-1.44-1.712-1.608-2.002-.17-.29-.018-.447.127-.591.13-.13.29-.339.435-.508.145-.17.193-.29.289-.483.097-.193.048-.363-.024-.508-.072-.145-.653-1.573-.895-2.153-.235-.569-.476-.491-.653-.5-.17-.008-.364-.01-.557-.01-.193 0-.508.072-.773.362-.266.291-1.015.992-1.015 2.418 0 1.425 1.039 2.805 1.185 3.001.145.193 2.043 3.12 4.949 4.373.692.298 1.231.476 1.652.609.697.221 1.332.19 1.834.115.56-.083 1.713-.699 1.954-1.374.242-.676.242-1.257.17-1.374-.072-.117-.266-.19-.556-.335z" />
                                        </svg>
                                        COMPLETE ON WHATSAPP
                                    </button>

                                    <button
                                        className="paystack-button-new"
                                        onClick={handlePaystackButtonClick}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'PROCESSING...' : 'PAY ONLINE (MOBILE MONEY / CARD)'}
                                    </button>

                                    <button className="continue-shopping" onClick={() => setStep('cart')}>
                                        ← Back to Cart
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {successOrder && (
                <ReceiptTemplate
                    orderId={successOrder.id}
                    items={successOrder.items || []}
                    total={successOrder.total || 0}
                    customer={successOrder.customer}
                    paymentMethod={successOrder.paymentMethod}
                />
            )}
        </div>
    );
};


export default FloatingCart;

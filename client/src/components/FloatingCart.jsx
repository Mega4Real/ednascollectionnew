import React, { useEffect, useRef, useState } from 'react';

const FloatingCart = ({ selectedItems, onRemoveItem }) => {
    const [isVisible, setIsVisible] = useState(true);
    const cartRef = useRef(null);

    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const handleSendToWhatsApp = () => {
        const baseUrl = window.location.origin;
        let message = "Hello! I'm interested in the following dresses:\n\n";

        selectedItems.forEach(item => {
            const imageUrl = item.imageUrl || item.image;
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}/${imageUrl}`;

            message += `🔍 View Dress: ${fullImageUrl}\n`;
            message += ` Size: ${item.selectedSize}\n`;
            message += `💰 Price: ₵${item.price.toFixed(2)}\n`;
            message += `-------------------------\n\n`;
        });

        message += `Total: ₵${total.toFixed(2)}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = "+233543806051";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '50px' }
        );

        const footer = document.querySelector('.site-footer');
        if (footer) {
            observer.observe(footer);
        }

        return () => {
            if (footer) observer.unobserve(footer);
        };
    }, []);

    return (
        <div className={`floating-cart ${!isVisible ? 'hide-cart' : ''}`} ref={cartRef}>
            <div className="cart-header">
                <div className="cart-count">
                    <span id="selected-count">{selectedItems.length}</span>
                    <span className="cart-label">Selected Items</span>
                </div>
                <div className="total-price" id="total-price">₵{total.toFixed(2)}</div>
            </div>
            <div className="selected-items" id="selected-items">
                {selectedItems.map(item => (
                    <div key={`${item.id}-${item.selectedSize}`} className="selected-item">
                        <img src={item.imageUrl || item.image} alt={`Dress ${item.id}`} />
                        <div className="item-details">
                            <div className="item-size">Size: {item.selectedSize}</div>
                            <div className="item-price">₵{item.price.toFixed(2)}</div>
                        </div>
                        <button
                            className="delete-item"
                            onClick={() => onRemoveItem(item.id)}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <button
                id="send-to-whatsapp"
                disabled={selectedItems.length === 0}
                onClick={handleSendToWhatsApp}
            >
                <span className="whatsapp-icon">📱</span>
                Send to WhatsApp
            </button>
        </div>
    );
};

export default FloatingCart;

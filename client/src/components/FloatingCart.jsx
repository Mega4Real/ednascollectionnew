import React, { useEffect, useRef, useState } from 'react';

const FloatingCart = ({ selectedItems, onRemoveItem }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
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
        const whatsappNumber = "+233274883478";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');
    };

    // Close on click outside or scroll
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cartRef.current && !cartRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleScroll = () => {
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [isOpen]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(!entry.isIntersecting);
            },
            { threshold: 0, rootMargin: '50px' } // Increased margin slightly
        );

        const targetSection = document.querySelector('.social-links');
        if (targetSection) {
            observer.observe(targetSection);
        }

        return () => {
            if (targetSection) observer.unobserve(targetSection);
        };
    }, []);

    // If empty, hide the cart completely
    if (selectedItems.length === 0) return null;

    return (
        <div className={`floating-cart-wrapper ${!isVisible ? 'hide' : ''}`} ref={cartRef}>
            {/* Round Toggle Button (FAB) */}
            <button
                className={`cart-fab ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Cart"
            >
                <div className="cart-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                </div>
                <span className="cart-badge">{selectedItems.length}</span>
            </button>

            {/* Expanded Content (Popup) */}
            {isOpen && (
                <div className="cart-popup">
                    <div className="cart-popup-header" onClick={() => setIsOpen(false)}>
                        <div className="header-left">
                            <span className="header-count">{selectedItems.length}</span>
                            <span className="header-label">Items</span>
                        </div>
                        <div className="header-total">
                            ₵{total.toFixed(2)}
                        </div>
                    </div>

                    <div className="selected-items">
                        {selectedItems.map(item => (
                            <div key={`${item.id}-${item.selectedSize}`} className="selected-item">
                                <img src={item.imageUrl || item.image} alt={`Dress ${item.id}`} />
                                <div className="item-details">
                                    <div className="item-size">Size: {item.selectedSize}</div>
                                    <div className="item-price">₵{item.price.toFixed(2)}</div>
                                </div>
                                <button
                                    className="delete-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveItem(item.id);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-popup-footer">
                        <button
                            id="send-to-whatsapp"
                            disabled={selectedItems.length === 0}
                            onClick={handleSendToWhatsApp}
                        >
                            <span className="whatsapp-icon">📱</span>
                            Send to WhatsApp
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingCart;

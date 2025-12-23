import React, { useEffect, useRef, useState } from 'react';

const FloatingCart = ({ selectedItems, onRemoveItem, onClearCart }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const cartRef = useRef(null);

    const total = selectedItems.reduce((sum, item) => sum + item.price, 0);

    const handleSendToWhatsApp = () => {
        const baseUrl = window.location.origin;
        let message = "Hello! I'm interested in the following items:\n\n";

        selectedItems.forEach(item => {
            const imageUrl = item.imageUrl || item.image;
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}/${imageUrl}`;

            message += ` View: ${fullImageUrl}\n`;
            message += ` Size: ${item.selectedSize}\n`;
            message += `💰 Price: ₵${item.price.toFixed(2)}\n`;
            message += `-------------------------\n\n`;
        });

        message += `Total: ₵${total.toFixed(2)}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappNumber = "+233274883478";
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        // Clear cart and close panel
        if (onClearCart) onClearCart();
        setIsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && cartRef.current && !cartRef.current.contains(event.target)) {
                // If the click is outside the cart POPUP but we are using a full screen layout on mobile,
                // we might need more specific logic. 
                // However, the cart-fab is part of the wrapper.
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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

    if (selectedItems.length === 0) return null;

    return (
        <div className={`floating-cart-wrapper ${!isVisible ? 'hide' : ''} ${isOpen ? 'open' : ''}`} ref={cartRef}>
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

            {/* Expanded Content (Popup/Modal) */}
            {isOpen && (
                <div className="cart-popup-overlay" onClick={() => setIsOpen(false)}>
                    <div className="cart-popup-new" onClick={(e) => e.stopPropagation()}>
                        <div className="cart-header-new">
                            <h3>Selected Items ({selectedItems.length})</h3>
                            <button className="close-cart-new" onClick={() => setIsOpen(false)}>×</button>
                        </div>

                        <div className="selected-items-new">
                            {selectedItems.map(item => (
                                <div key={`${item.id}-${item.selectedSize}`} className="cart-item-card">
                                    <div className="item-image-container">
                                        <img src={item.imageUrl || item.image} alt={item.name} />
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
                                SEND TO WHATSAPP
                            </button>

                            <button className="continue-shopping" onClick={() => setIsOpen(false)}>
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


export default FloatingCart;

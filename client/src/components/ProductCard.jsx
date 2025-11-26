import React, { useState } from 'react';

const ProductCard = ({ product, isSelected, selectedSize: propSelectedSize, onToggleSelect, onPreview }) => {
    const [selectedSize, setSelectedSize] = useState(propSelectedSize || null);

    // Sync local state with prop when it changes (e.g. loaded from storage or removed from cart)
    React.useEffect(() => {
        if (isSelected && propSelectedSize) {
            setSelectedSize(propSelectedSize);
        } else if (!isSelected) {
            setSelectedSize(null);
        }
    }, [isSelected, propSelectedSize]);

    const handleSizeClick = (e, size) => {
        e.stopPropagation();
        setSelectedSize(size);
    };

    const handleImageClick = (e) => {
        e.stopPropagation();
        onPreview(product);
    };

    const handleCardClick = () => {
        if (isSelected) {
            onToggleSelect(product, null);
            setSelectedSize(null); // Reset size on deselect
        } else {
            if (selectedSize) {
                onToggleSelect(product, selectedSize);
            } else {
                alert('Please select a size first');
            }
        }
    };

    return (
        <div
            className={`dress-card ${isSelected ? 'selected' : ''}`}
            onClick={handleCardClick}
            data-id={product.id}
        >
            <img
                src={product.imageUrl || product.image}
                alt={`Dress ${product.id}`}
                className="dress-image"
                onClick={handleImageClick}
            />
            <div className="dress-info">
                <div className="dress-price">₵{product.price.toFixed(2)}</div>
                <div className="size-options">
                    {product.sizes.map(size => (
                        <span
                            key={size}
                            className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                            onClick={(e) => handleSizeClick(e, size)}
                            data-size={size}
                        >
                            {size}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

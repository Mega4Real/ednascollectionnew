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

    return (
        <div
            className={`dress-card ${isSelected ? 'selected' : ''}`}
            onClick={handleCardClick}
            data-id={product.id}
        >
            <img
                src={getOptimizedImageUrl(product.imageUrl || product.image)}
                alt={`Dress ${product.id}`}
                className="dress-image"
                onClick={handleImageClick}
                loading="lazy"
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

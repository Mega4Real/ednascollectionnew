import React, { useRef } from 'react';

const VideoModal = ({ product, onClose }) => {
    const videoRef = useRef(null);

    if (!product) return null;

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal')) {
            onClose();
        }
    };

    const handleError = () => {
        // If video fails, we could show an image or just hide the video
        // For now, let's just log it. The original script replaced it with an image.
        if (videoRef.current) {
            videoRef.current.style.display = 'none';
            // Create fallback image
            const img = document.createElement('img');
            img.src = product.imageUrl || product.image;
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '4px';
            videoRef.current.parentElement.appendChild(img);
        }
    };

    const videoSrc = product.videoUrl || `videos/dress${product.id}.mp4`;

    return (
        <div className="modal" style={{ display: 'block' }} onClick={handleBackdropClick}>
            <div className="modal-content">
                <span className="close-modal" onClick={onClose}>&times;</span>
                <div className="preview-video-container">
                    <video
                        id="preview-video"
                        controls
                        autoPlay
                        muted
                        loop
                        ref={videoRef}
                        onError={handleError}
                    >
                        <source src={videoSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
                <div className="preview-price">₵{product.price.toFixed(2)}</div>
            </div>
        </div>
    );
};

export default VideoModal;

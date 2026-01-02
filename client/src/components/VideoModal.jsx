import React, { useRef, useEffect } from 'react';

const VideoModal = ({ product, onClose }) => {
    const videoRef = useRef(null);

    if (!product) return null;

    // Auto-enter fullscreen and play with sound when modal opens
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const enterFullscreen = async () => {
            try {
                // Unmute and play the video
                video.muted = false;
                video.volume = 1.0;

                // Play the video first
                await video.play();

                // Request fullscreen - works on both iOS and Android
                if (video.requestFullscreen) {
                    await video.requestFullscreen();
                } else if (video.webkitRequestFullscreen) {
                    // Safari/iOS
                    await video.webkitRequestFullscreen();
                } else if (video.webkitEnterFullscreen) {
                    // iOS Safari (older versions)
                    video.webkitEnterFullscreen();
                } else if (video.mozRequestFullScreen) {
                    // Firefox
                    await video.mozRequestFullScreen();
                } else if (video.msRequestFullscreen) {
                    // IE/Edge
                    await video.msRequestFullscreen();
                }
            } catch (error) {
                console.log('Fullscreen request failed:', error);
                // Fallback: just play with sound if fullscreen fails
                video.muted = false;
                video.volume = 1.0;
                video.play().catch(e => console.log('Play failed:', e));
            }
        };

        // Small delay to ensure video is loaded
        const timer = setTimeout(enterFullscreen, 100);

        return () => clearTimeout(timer);
    }, [product]);

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

    // Helper to optimize the Cloudinary URL
    const getOptimizedVideoUrl = (url) => {
        if (!url || !url.includes('cloudinary.com')) return url;
        
        // This inserts 'q_auto,f_auto' into the URL path
        // From: .../upload/v12345/video.mp4
        // To:   .../upload/q_auto,f_auto/v12345/video.mp4
        return url.replace('/upload/', '/upload/q_auto,f_auto/');
    };

    const videoSrc = getOptimizedVideoUrl(product.videoUrl || `videos/dress${product.id}.mp4`);

    return (
        <div className="modal" style={{ display: 'block' }} onClick={handleBackdropClick}>
            <div className="modal-content">
                <span className="close-modal" onClick={onClose}>&times;</span>
                <div className="preview-video-container">
                    <video
                        id="preview-video"
                        controls
                        controlsList="nodownload"
                        autoPlay
                        playsInline
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

import React, { useState, useEffect, forwardRef } from 'react';
import landingBg from '/landing-bg.webp';
import landingMobile from '/landing-mobile.webp';

const Hero = forwardRef(({ onEnterShop }, ref) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [bannerMessage, setBannerMessage] = useState('');
    const [bannerLoading, setBannerLoading] = useState(true);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch banner message from API
    useEffect(() => {
        const fetchBanner = async () => {
            setBannerLoading(true);
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${API_URL}/api/settings/banner?_t=${Date.now()}`);
                const data = await res.json();
                if (data.message) {
                    setBannerMessage(data.message);
                }
            } catch (error) {
                console.log('Using default banner');
            } finally {
                setBannerLoading(false);
            }
        };

        fetchBanner();

        // Listen for banner updates from admin dashboard
        const handleBannerUpdate = () => {
            fetchBanner();
        };

        window.addEventListener('bannerUpdated', handleBannerUpdate);

        return () => {
            window.removeEventListener('bannerUpdated', handleBannerUpdate);
        };
    }, []);

    const handleEnterShop = () => {
        if (onEnterShop) {
            onEnterShop();
        } else {
            const productContainer = document.querySelector('.dress-container');
            if (productContainer) {
                productContainer.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <section
            ref={ref}
            className="hero-section"
            style={{ backgroundImage: `url(${isMobile ? '/landing-mobile.webp' : '/landing-bg.webp'})` }}
        >
            {!bannerLoading && bannerMessage && (
                <div className="hero-banner">
                    <p>{bannerMessage}</p>
                </div>
            )}
            <div className="hero-overlay"></div>

            <div className="hero-content">
                <h1 className="hero-title">Erdnas Collections</h1>
                <p className="hero-motto">Your Authentic Dress Plug</p>
                <button className="hero-button" onClick={handleEnterShop}>
                    Shop Now
                </button>
            </div>
        </section>
    );
});

export default Hero;

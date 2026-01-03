import React, { useState, useEffect, forwardRef } from 'react';
import landingBg from '/landing-bg.webp';
import landingMobile from '/landing-mobile.webp';

const Hero = forwardRef(({ onEnterShop }, ref) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
            {isMobile && (
                <div className="hero-banner">
                    <p>Welcome to Erdnas Collections | Experience the best online shopping | Shop Now For Affordable Prices </p>
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

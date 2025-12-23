import React, { useState, useEffect } from 'react';

const Hero = ({ onEnterShop }) => {
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
            className="hero-section"
            style={{ backgroundImage: `url(${isMobile ? '/landing-mobile.webp' : '/landing-bg.webp'})` }}
        >
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
};

export default Hero;

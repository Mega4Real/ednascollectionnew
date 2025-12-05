import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleEnter = () => {
        navigate('/shop');
    };

    return (
        <div
            className="landing-page"
            style={{ backgroundImage: `url(${isMobile ? '/landing-mobile.png' : '/landing-bg.png'})` }}
        >
            <div className="landing-overlay"></div>

            <div className="landing-content">
                <h1 className="landing-title">Ednas Collections</h1>
                <p className="landing-motto">Your Authentic Dress Plug</p>
                <button className="landing-button" onClick={handleEnter}>
                    Shop Now
                </button>
            </div>
        </div>
    );
};

export default LandingPage;

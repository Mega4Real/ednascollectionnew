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
        <div className="landing-page">
            <video
                className="landing-video"
                autoPlay
                muted
                loop
                playsInline
                key={isMobile ? 'mobile' : 'desktop'}
            >
                <source src={isMobile ? '/L1.mp4' : '/L2.mp4'} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className="landing-overlay"></div>

            <div className="landing-content">

                <p className="landing-subtitle">Discover Your Perfect Style</p>
                <button className="landing-button" onClick={handleEnter}>
                    Shop Now
                </button>
            </div>
        </div>
    );
};

export default LandingPage;

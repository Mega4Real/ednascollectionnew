import React from 'react';

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>📞 Phone: <a href="tel:+233540665045">+233 54 066 5045</a></p>
                    <p>✉️ Email: info@ednascollections.com</p>
                </div>

                <div className="footer-section">
                    <h3>Location</h3>
                    <p>🏢 Ablekuman, Manhean Tigo Pole</p>
                    <p>📍 Accra, Ghana</p>
                    <p>🕒 Mon-Sun: 7am - 10pm</p>
                </div>

                <div className="footer-section social-links">
                    <h3>Follow Us</h3>
                    <div className="social-icons-grid">
                        <div className="social-column">
                            <a href="https://wa.me/233274883478" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp">
                                📱 WhatsApp
                            </a>
                            <a href="https://www.tiktok.com/@ednas_collections" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                                🎵 TikTok
                            </a>
                        </div>
                        <div className="social-column">
                            <a href="https://www.snapchat.com/add/yhaar_strawbry" target="_blank" rel="noopener noreferrer" className="social-icon snapchat">
                                👻 Snapchat
                            </a>
                            <a href="https://www.instagram.com/erdnas_collections" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                                📸 Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

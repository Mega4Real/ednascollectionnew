import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import Footer from '../components/Footer';
import VideoModal from '../components/VideoModal';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ price: '', size: '' });

    // Initialize selectedItems from localStorage
    const [selectedItems, setSelectedItems] = useState(() => {
        const saved = localStorage.getItem('selectedItems');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [previewProduct, setPreviewProduct] = useState(null);
    const itemsPerPage = 50;

    const [loading, setLoading] = useState(true);

    // Save selectedItems to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    }, [selectedItems]);

    // Fetch products from API with caching
    useEffect(() => {
        const fetchProducts = async () => {
            const CACHE_KEY = 'cachedProducts';
            const CACHE_DURATION = 60 * 1000; // 1 minute

            try {
                setLoading(true);

                // Check cache first
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { products, timestamp } = JSON.parse(cachedData);
                    const now = new Date().getTime();

                    if (now - timestamp < CACHE_DURATION) {
                        setProducts(products);
                        setLoading(false);
                        return;
                    }
                }

                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/products`);

                // Sort by position if available, otherwise by ID
                const sortedProducts = (res.data || []).sort((a, b) => {
                    if (a.position !== undefined && b.position !== undefined) {
                        return a.position - b.position;
                    }
                    return a.id - b.id;
                });

                setProducts(sortedProducts);

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    products: sortedProducts,
                    timestamp: new Date().getTime()
                }));

            } catch (error) {
                console.error('Error fetching products:', error);
                // Try to use stale cache if network fails
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    const { products } = JSON.parse(cachedData);
                    setProducts(products);
                } else {
                    setProducts([]);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Price filter
            let priceMatch = true;
            if (filters.price) {
                if (filters.price === '300+') {
                    priceMatch = product.price >= 300;
                } else {
                    const [min, max] = filters.price.split('-').map(Number);
                    priceMatch = product.price >= min && product.price <= max;
                }
            }

            // Size filter
            let sizeMatch = true;
            if (filters.size) {
                sizeMatch = product.sizes.includes(filters.size);
            }

            return priceMatch && sizeMatch;
        });
    }, [products, filters]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const currentProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleToggleSelect = (product, size) => {
        if (!size) {
            // Deselect
            setSelectedItems(prev => prev.filter(item => item.id !== product.id));
        } else {
            // Select or update size
            setSelectedItems(prev => {
                const existing = prev.find(item => item.id === product.id);
                if (existing) {
                    return prev.map(item => item.id === product.id ? { ...product, selectedSize: size } : item);
                }
                return [...prev, { ...product, selectedSize: size }];
            });
        }
    };

    const handleRemoveItem = (id) => {
        setSelectedItems(prev => prev.filter(item => item.id !== id));
    };

    const handleClearCart = () => {
        setSelectedItems([]);
        localStorage.removeItem('selectedItems');
    };

    const clearFilters = () => {
        setFilters({ price: '', size: '' });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll to top of product grid, accounting for fixed header
        const dressContainer = document.querySelector('.dress-container');
        if (dressContainer) {
            const headerHeight = window.innerWidth <= 768 ? 40 : 128; // Approximate header heights
            const offsetTop = dressContainer.offsetTop - headerHeight;
            window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const [showHero, setShowHero] = useState(true);
    const heroRef = useRef(null);

    const handleEnterShop = () => {
        setShowHero(false);
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    // Hide header and filters when hero section is visible, show them when on product section
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Hide header and filters when hero is at least 50% visible
                const headerElement = document.querySelector('header');
                const filtersElement = document.querySelector('.filters');

                if (entry.isIntersecting) {
                    if (headerElement) headerElement.classList.add('hidden');
                    if (filtersElement) filtersElement.classList.add('hidden');
                } else {
                    if (headerElement) headerElement.classList.remove('hidden');
                    if (filtersElement) filtersElement.classList.remove('hidden');
                }
            },
            {
                threshold: 0.5, // Trigger when 50% of hero is visible
                rootMargin: '-80px 0px 0px 0px' // Account for fixed header
            }
        );

        if (heroRef.current) {
            observer.observe(heroRef.current);
        }

        // Handle header visibility based on showHero state
        const headerElement = document.querySelector('header');
        const filtersElement = document.querySelector('.filters');

        if (showHero) {
            // When hero is shown, hide header initially (intersection observer will handle visibility)
            if (headerElement) headerElement.classList.add('hidden');
            if (filtersElement) filtersElement.classList.add('hidden');
        } else {
            // When hero is not shown (on product section), always show header
            if (headerElement) headerElement.classList.remove('hidden');
            if (filtersElement) filtersElement.classList.remove('hidden');
        }

        return () => {
            if (heroRef.current) {
                observer.unobserve(heroRef.current);
            }
        };
    }, [showHero]);

    // Hide hero if scrolled past a certain point
    useEffect(() => {
        const handleScroll = () => {
            if (showHero && window.scrollY > 300) {
                setShowHero(false);
                window.scrollTo({ top: 0, behavior: 'instant' });
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [showHero]);

    return (
        <div className="app-container">
            <Helmet>
                <title>Erdnas Collections - Authentic Dress Gallery | Shop Affordable Fashion</title>
                <meta name="description" content="Discover Erdnas Collections - your authentic dress plug for affordable, high-quality fashion. Shop our curated collection of dresses, sizes S-18, with secure checkout and fast delivery." />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://erdnascollections.com/" />
                <meta property="og:title" content="Erdnas Collections - Authentic Dress Gallery" />
                <meta property="og:description" content="Discover Erdnas Collections - your authentic dress plug for affordable, high-quality fashion. Shop our curated collection of dresses, sizes S-18." />
                <meta property="og:image" content="https://erdnascollections.com/landing-mobile.webp" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://erdnascollections.com/" />
                <meta property="twitter:title" content="Erdnas Collections - Authentic Dress Gallery" />
                <meta property="twitter:description" content="Discover Erdnas Collections - your authentic dress plug for affordable, high-quality fashion. Shop our curated collection of dresses, sizes S-18." />
                <meta property="twitter:image" content="https://erdnascollections.com/landing-mobile.webp" />
            </Helmet>
            <Header
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
                onLogoClick={() => {
                    setShowHero(true);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            />

            <main>
                {showHero && <Hero ref={heroRef} onEnterShop={handleEnterShop} />}
                <div className="dress-container">
                    {loading ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '4rem',
                            fontSize: '1.2rem',
                            color: '#666'
                        }}>
                            Loading products...
                        </div>
                    ) : (
                        currentProducts.map(product => {
                            const selectedItem = selectedItems.find(item => item.id === product.id);
                            return (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    isSelected={!!selectedItem}
                                    selectedSize={selectedItem?.selectedSize}
                                    onToggleSelect={handleToggleSelect}
                                    onPreview={setPreviewProduct}
                                />
                            );
                        })
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </button>

                        {getPageNumbers().map(page => (
                            <button
                                key={page}
                                className={currentPage === page ? 'active' : ''}
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>

            <FloatingCart
                selectedItems={selectedItems}
                onRemoveItem={handleRemoveItem}
                onClearCart={handleClearCart}
            />

            <Footer />

            {previewProduct && (
                <VideoModal
                    product={previewProduct}
                    onClose={() => setPreviewProduct(null)}
                />
            )}
        </div>
    );
};

export default Home;

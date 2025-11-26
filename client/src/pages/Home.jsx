import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import FloatingCart from '../components/FloatingCart';
import Footer from '../components/Footer';
import VideoModal from '../components/VideoModal';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({ price: '', size: '' });
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [previewProduct, setPreviewProduct] = useState(null);
    const itemsPerPage = 50;

    // Fetch products from API
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/products`);
                const sortedProducts = (res.data || []).sort((a, b) => a.id - b.id);
                setProducts(sortedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
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

    const clearFilters = () => {
        setFilters({ price: '', size: '' });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    return (
        <div className="app-container">
            <Header
                filters={filters}
                setFilters={setFilters}
                clearFilters={clearFilters}
            />

            <main>
                <div className="dress-container">
                    {currentProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isSelected={selectedItems.some(item => item.id === product.id)}
                            onToggleSelect={handleToggleSelect}
                            onPreview={setPreviewProduct}
                        />
                    ))}
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

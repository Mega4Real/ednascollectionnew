import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        imageUrl: '',
        videoUrl: '',
        price: '',
        sizes: []
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const navigate = useNavigate();

    const availableSizes = ['S', 'M', 'L', 'XL', '6', '8', '10', '12', '14', '16', '18', '6/8', '8/10', '10/12', '12/14', '14/16', '16/18'];

    const fetchProducts = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/products`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'id') {
            setFormData({ ...formData, id: value ? parseInt(value) : null });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSizeChange = (size) => {
        const currentSizes = formData.sizes;
        if (currentSizes.includes(size)) {
            setFormData({ ...formData, sizes: currentSizes.filter(s => s !== size) });
        } else {
            setFormData({ ...formData, sizes: [...currentSizes, size] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            if (editingId) {
                // Update existing product
                await axios.put(`${apiUrl}/api/products/${editingId}`, {
                    ...formData,
                    price: parseFloat(formData.price)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product updated successfully');
                setEditingId(null);
            } else {
                // Create new product
                await axios.post(`${apiUrl}/api/products`, {
                    ...formData,
                    price: parseFloat(formData.price)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product added successfully');
            }

            setFormData({ imageUrl: '', videoUrl: '', price: '', sizes: [] });
            fetchProducts();
        } catch (error) {
            alert(editingId ? 'Error updating product' : 'Error adding product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const handleEdit = (product) => {
        setEditingId(product.id);
        setFormData({
            imageUrl: product.imageUrl || product.image,
            videoUrl: product.videoUrl || product.video || '',
            price: product.price.toString(),
            sizes: product.sizes
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ imageUrl: '', videoUrl: '', price: '', sizes: [] });
    };

    const handleMove = async (index, direction) => {
        const newProducts = [...products];
        if (direction === 'up' && index > 0) {
            [newProducts[index], newProducts[index - 1]] = [newProducts[index - 1], newProducts[index]];
        } else if (direction === 'down' && index < newProducts.length - 1) {
            [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
        } else {
            return;
        }

        // Update local state immediately for UI responsiveness
        setProducts(newProducts);

        // Prepare payload for backend
        const reorderedPayload = newProducts.map((product, idx) => ({
            id: product.id,
            position: idx
        }));

        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/products/reorder`, { products: reorderedPayload }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Error saving order', error);
            alert('Failed to save new order');
            fetchProducts(); // Revert on error
        }
    };

    return (
        <div className="admin-dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Logout
                </button>
            </div>

            <div className="add-product-section" style={{ background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                    <div>
                        <label>Product ID (Optional - Manual Override)</label>
                        <input
                            type="number"
                            name="id"
                            value={formData.id || ''}
                            onChange={handleInputChange}
                            placeholder="Leave empty for auto-generated ID"
                            disabled={!!editingId} // Disable ID editing when updating
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <div>
                        <label>Image URL (Direct Link)</label>
                        <input
                            type="text"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleInputChange}
                            required
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <div>
                        <label>Video URL (Optional)</label>
                        <input
                            type="text"
                            name="videoUrl"
                            value={formData.videoUrl}
                            onChange={handleInputChange}
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <div>
                        <label>Price (₵)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                            step="0.01"
                            style={{ width: '100%', padding: '0.5rem' }}
                        />
                    </div>

                    <div>
                        <label>Sizes</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                            {availableSizes.map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => handleSizeChange(size)}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        background: formData.sizes.includes(size) ? '#ff69b4' : 'white',
                                        color: formData.sizes.includes(size) ? 'white' : '#333',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem',
                                background: '#ff69b4',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                flex: 1
                            }}
                        >
                            {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Product' : 'Add Product')}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                style={{
                                    padding: '0.75rem',
                                    background: '#666',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="product-list">
                <h2>Product List ({products.length})</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                        <thead>
                            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>ID</th>
                                <th style={{ padding: '1rem' }}>Image</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Sizes</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product, index) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{product.id}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <img src={product.imageUrl || product.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                    </td>
                                    <td style={{ padding: '1rem' }}>₵{product.price.toFixed(2)}</td>
                                    <td style={{ padding: '1rem' }}>{product.sizes.join(', ')}</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleMove(index, 'up')}
                                            disabled={index === 0}
                                            style={{ padding: '0.25rem 0.5rem', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1 }}
                                        >
                                            ↑
                                        </button>
                                        <button
                                            onClick={() => handleMove(index, 'down')}
                                            disabled={index === products.length - 1}
                                            style={{ padding: '0.25rem 0.5rem', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: index === products.length - 1 ? 'not-allowed' : 'pointer', opacity: index === products.length - 1 ? 0.5 : 1 }}
                                        >
                                            ↓
                                        </button>
                                        <button
                                            onClick={() => handleEdit(product)}
                                            style={{ padding: '0.25rem 0.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={{ padding: '0.25rem 0.5rem', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

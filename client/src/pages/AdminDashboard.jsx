import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        imageUrl: '',
        videoUrl: '',
        price: '',
        sizes: [],
        isSold: false
    });
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products');
    const navigate = useNavigate();

    const availableSizes = ['S', 'M', 'L', 'XL', '6', '8', '10', '12', '14', '16', '18', '6/8', '8/10', '10/12', '12/14', '14/16', '16/18'];

    const fetchProducts = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/products?_t=${Date.now()}`);
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching products', error);
        }
    };

    const clearProductCache = () => {
        localStorage.removeItem('cachedProducts');
    };

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.get(`${apiUrl}/api/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data.orders);
        } catch (error) {
            console.error('Error fetching orders', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/admin/login');
            return;
        }
        fetchProducts();
        fetchOrders();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
                await axios.put(`${apiUrl}/api/products/${editingId}`, {
                    ...formData,
                    price: parseFloat(formData.price)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product updated successfully');
                setEditingId(null);
            } else {
                await axios.post(`${apiUrl}/api/products`, {
                    ...formData,
                    price: parseFloat(formData.price)
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Product added successfully');
            }

            clearProductCache();
            setFormData({ imageUrl: '', videoUrl: '', price: '', sizes: [], isSold: false });
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
            clearProductCache();
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
            sizes: product.sizes,
            isSold: product.isSold || false
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ imageUrl: '', videoUrl: '', price: '', sizes: [], isSold: false });
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
        setProducts(newProducts);
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
            clearProductCache();
        } catch (error) {
            console.error('Error saving order', error);
            alert('Failed to save new order');
            fetchProducts();
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrders();
        } catch (error) {
            alert('Error updating order status');
        }
    };

    const handleToggleSold = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.put(`${apiUrl}/api/products/${product.id}`, {
                imageUrl: product.imageUrl,
                videoUrl: product.videoUrl || '',
                price: product.price,
                sizes: product.sizes,
                isSold: !product.isSold
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            clearProductCache();
            fetchProducts();
        } catch (error) {
            console.error('Error updating product status:', error);
            alert('Error updating product status');
        }
    };

    const handleOrderDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this completed order?')) return;
        try {
            const token = localStorage.getItem('token');
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.delete(`${apiUrl}/api/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Order deleted successfully');
            fetchOrders();
        } catch (error) {
            alert(error.response?.data?.message || 'Error deleting order');
        }
    };

    return (
        <div className="admin-dashboard" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setActiveTab('products')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === 'products' ? '#ff69b4' : '#eee',
                            color: activeTab === 'products' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Products
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: activeTab === 'orders' ? '#ff69b4' : '#eee',
                            color: activeTab === 'orders' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        Orders ({orders.length})
                    </button>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: '1rem' }}>
                        Logout
                    </button>
                </div>
            </div>

            {activeTab === 'products' ? (
                <>
                    <div className="add-product-section" style={{ padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                        <h2>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '600px' }}>
                            <div>
                                <label>Image URL</label>
                                <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} required style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div>
                                <label>Video URL (Optional)</label>
                                <input type="text" name="videoUrl" value={formData.videoUrl} onChange={handleInputChange} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div>
                                <label>Price (₵)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleInputChange} required step="0.01" style={{ width: '100%', padding: '0.5rem' }} />
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
                                <button type="submit" disabled={loading} style={{ padding: '0.75rem', background: '#ff69b4', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
                                    {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Product' : 'Add Product')}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={handleCancelEdit} style={{ padding: '0.75rem', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="product-list">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            Product List ({products.length}) | Total Price: ₵{products.reduce((sum, product) => sum + product.price, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left' }}>
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
                                                <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                                                    <img src={product.imageUrl || product.image} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                                    {product.isSold && (
                                                        <span style={{ position: 'absolute', top: 0, left: 0, background: 'red', color: 'white', fontSize: '0.6rem', padding: '2px', fontWeight: 'bold' }}>SOLD</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>₵{product.price.toFixed(2)}</td>
                                            <td style={{ padding: '1rem' }}>{product.sizes.join(', ')}</td>
                                            <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => handleMove(index, 'up')} disabled={index === 0} style={{ padding: '0.25rem 0.5rem', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.5 : 1 }}>↑</button>
                                                <button onClick={() => handleMove(index, 'down')} disabled={index === products.length - 1} style={{ padding: '0.25rem 0.5rem', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: index === products.length - 1 ? 'not-allowed' : 'pointer', opacity: index === products.length - 1 ? 0.5 : 1 }}>↓</button>
                                                <button onClick={() => handleEdit(product)} style={{ padding: '0.25rem 0.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                                <button onClick={() => handleToggleSold(product)} style={{ padding: '0.25rem 0.5rem', background: product.isSold ? '#f44336' : '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{product.isSold ? 'Sold' : 'Mark Sold'}</button>
                                                <button onClick={() => handleDelete(product.id)} style={{ padding: '0.25rem 0.5rem', background: 'red', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="orders-section">
                    <h2 style={{ marginBottom: '1.5rem' }}>Order Management</h2>
                    <div className="table-container" style={{ background: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                    <th style={{ padding: '1rem' }}>Customer</th>
                                    <th style={{ padding: '1rem' }}>Contact</th>
                                    <th style={{ padding: '1rem' }}>Total</th>
                                    <th style={{ padding: '1rem' }}>Method</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                                        <td style={{ padding: '1rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString()}<br />
                                            <span style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(order.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <strong>{order.customerName}</strong><br />
                                            <span style={{ fontSize: '0.8rem', color: '#ff69b4', fontWeight: 'bold' }}>{order.paymentReference || 'N/A'}</span><br />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{order.address}, {order.city}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <a href={`tel:${order.phone}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: '500' }}>{order.phone}</a><br />
                                            <span style={{ fontSize: '0.8rem', color: '#666' }}>{order.email}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>₵{order.totalAmount.toFixed(2)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: order.paymentMethod === 'PAYSTACK' ? '#e3f2fd' : '#f1f8e9',
                                                color: order.paymentMethod === 'PAYSTACK' ? '#1976d2' : '#388e3c'
                                            }}>
                                                {order.paymentMethod}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: order.status === 'PAID' ? '#e8f5e9' : (order.status === 'PENDING' ? '#fff3e0' : '#f5f5f5'),
                                                color: order.status === 'PAID' ? '#2e7d32' : (order.status === 'PENDING' ? '#ef6c00' : '#616161'),
                                                fontWeight: 'bold'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => setSelectedOrder(order)} style={{ padding: '0.4rem 0.75rem', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>Details</button>
                                            <select value={order.status} onChange={(e) => handleUpdateStatus(order.id, e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}>
                                                <option value="PENDING">Pending</option>
                                                <option value="PAID">Paid</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                            <button
                                                onClick={() => handleOrderDelete(order.id)}
                                                style={{ padding: '0.4rem 0.75rem', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No orders found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000 }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Order Details</h2>
                                <p style={{ margin: 0, color: '#ff69b4', fontWeight: 'bold' }}>Reference: {selectedOrder.paymentReference || selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4>Customer Info</h4>
                            <p><strong>Name:</strong> {selectedOrder.customerName}</p>
                            <p><strong>Phone:</strong> <a href={`tel:${selectedOrder.phone}`} style={{ textDecoration: 'none', color: '#2196f3', fontWeight: 'bold' }}>{selectedOrder.phone}</a></p>
                            <p><strong>Email:</strong> {selectedOrder.email}</p>
                            <p><strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city}</p>
                        </div>
                        <div>
                            <h4>Items</h4>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                                    <img src={item.product?.imageUrl || item.product?.image} alt="" style={{ width: '40px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0 }}><strong>Product ID:</strong> {item.productId}</p>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Size: {item.size}</p>
                                    </div>
                                    <div><strong>₵{item.price.toFixed(2)}</strong></div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '2px solid #eee' }}>
                                <strong>Total</strong>
                                <strong>₵{selectedOrder.totalAmount.toFixed(2)}</strong>
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                            <button onClick={() => window.print()} style={{ padding: '0.5rem 1.5rem', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Print Invoice</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

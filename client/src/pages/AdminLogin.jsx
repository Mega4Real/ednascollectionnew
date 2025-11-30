import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await axios.post(`${apiUrl}/api/auth/login`, {
                username,
                password
            });

            localStorage.setItem('token', res.data.token);
            navigate('/admin/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="login-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <h2>Admin Login</h2>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                gap: '1rem',
                width: '100%',
                maxWidth: '300px',
                padding: '2rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                background: 'white'
            }}>
                {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        padding: '0.75rem',
                        background: '#ff69b4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;

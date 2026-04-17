import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            let userData;
            if (isLogin) {
                userData = await login(email, password);
            } else {
                userData = await register(name, email, password);
            }
            
            toast.success(isLogin ? 'Login successful!' : 'Registration successful!');
            
            // Redirect based on role
            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/customer');
            }
        } catch (error) {
            // Helpful diagnostics (especially when backend isn't reachable)
            // eslint-disable-next-line no-console
            console.error('Auth error:', error);
            const message =
                error.response?.data?.message ||
                (error.code === 'ERR_NETWORK' ? 'Cannot reach server (is backend running on port 5000?)' : null) ||
                'Authentication failed';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>{isLogin ? 'Login to Prime Bags' : 'Create Account'}</h2>
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="auth-row">
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="input"
                            />
                        </div>
                    )}
                    
                    <div className="auth-row">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    
                    <div className="auth-row" style={{ marginBottom: '18px' }}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary auth-submit"
                        style={{ opacity: loading ? 0.7 : 1 }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                
                <p className="auth-toggle">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        type="button"
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
                
                <div className="auth-hint">
                    <p>
                        Demo Credentials:<br/>
                        Customer: customer@example.com / PrimeBagsCustomer#2026<br/>
                        Admin: admin@primebags.com / PrimeBagsAdmin#2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

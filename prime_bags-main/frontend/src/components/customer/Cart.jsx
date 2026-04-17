import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { FaTrash } from 'react-icons/fa';

const Cart = () => {
    const navigate = useNavigate();
    const { cart, updateQuantity, removeItem, loading } = useCart();

    if (loading) {
        return <div className="loading-spinner">Loading...</div>;
    }

    if (!cart.items || cart.items.length === 0) {
        return (
            <>
                <Navbar />
                <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <h2>Your cart is empty</h2>
                    <p className="muted" style={{ marginTop: 8 }}>
                        Add some products to your cart!
                    </p>
                    <button className="btn btn-primary" onClick={() => navigate('/customer')} style={{ marginTop: '20px' }}>
                        Continue Shopping
                    </button>
                </div>
                <Footer />
            </>
        );
    }

    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Navbar />
            <div className="container page" style={{ textAlign: 'left' }}>
                <h2 style={{ marginBottom: 18 }}>Shopping Cart</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '22px' }}>
                    <div>
                        {cart.items.map((item) => (
                            <div key={item.product_id} className="card" style={{ marginBottom: 14 }}>
                                <div style={{ display: 'flex', gap: 18, padding: 16, alignItems: 'center' }}>
                                    <img
                                        src={item.image_url || 'https://via.placeholder.com/80x80'}
                                        alt={item.name}
                                        style={{ width: 84, height: 84, objectFit: 'cover', borderRadius: 14, border: '1px solid rgba(212,175,55,0.14)' }}
                                    />

                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                            <div>
                                                <h3 style={{ marginBottom: 6 }}>{item.name}</h3>
                                                <div className="muted" style={{ fontWeight: 700 }}>
                                                    ₹{Number(item.price || 0).toFixed(2)}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', fontWeight: 900 }}>
                                                ₹{(Number(item.price || 0) * item.quantity).toFixed(2)}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                                            <span className="label">Quantity</span>
                                            <div className="qty-stepper">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                                                    disabled={item.quantity <= 1}
                                                    aria-label="Decrease quantity"
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.stock_quantity}
                                                    value={item.quantity}
                                                    onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value, 10) || 1)}
                                                    aria-label="Quantity"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, Math.min(item.stock_quantity, item.quantity + 1))}
                                                    disabled={item.stock_quantity === 0 || item.quantity >= item.stock_quantity}
                                                    aria-label="Increase quantity"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product_id)}
                                                className="btn btn-danger"
                                                style={{ padding: '10px 12px' }}
                                            >
                                                <FaTrash /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ padding: 18, height: 'fit-content' }}>
                        <h3 style={{ marginBottom: 10 }}>Order Summary</h3>
                        <div style={{ marginTop: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span className="muted">Subtotal ({totalItems} items)</span>
                                <span style={{ fontWeight: 900 }}>₹{cart.total.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <span className="muted">Shipping</span>
                                <span style={{ fontWeight: 800 }}>Free</span>
                            </div>
                            <div style={{ borderTop: '1px solid rgba(17,24,39,0.10)', paddingTop: 12, marginTop: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
                                    <span style={{ fontWeight: 900 }}>Total</span>
                                    <span style={{ fontWeight: 950 }}>₹{cart.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        <button className="btn btn-success" onClick={() => navigate('/customer/checkout')} style={{ width: '100%', marginTop: 14 }}>
                            Proceed to Checkout
                        </button>
                        <button className="btn" onClick={() => navigate('/customer')} style={{ width: '100%', marginTop: 10 }}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Cart;


import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import orderService from '../../services/orderService';

const statusTone = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'pending') return { bg: 'rgba(212,175,55,0.16)', fg: 'rgba(11,18,32,0.92)', border: 'rgba(212,175,55,0.30)' };
    if (s === 'delivered') return { bg: 'rgba(15,118,110,0.12)', fg: 'rgba(15,118,110,0.95)', border: 'rgba(15,118,110,0.26)' };
    if (s === 'cancelled') return { bg: 'rgba(180,35,24,0.10)', fg: 'rgba(180,35,24,0.95)', border: 'rgba(180,35,24,0.22)' };
    return { bg: 'rgba(17,24,39,0.06)', fg: 'rgba(11,18,32,0.92)', border: 'rgba(17,24,39,0.12)' };
};

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getUserOrders();
            setOrders(data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container page" style={{ textAlign: 'left' }}>
                <h2>My Orders</h2>

                {orders.length === 0 ? (
                    <div className="card" style={{ padding: 18, marginTop: 16 }}>
                        <p className="muted">You have no orders yet.</p>
                    </div>
                ) : (
                    <div style={{ marginTop: 16 }}>
                        {orders.map((o) => {
                            const tone = statusTone(o.status);
                            return (
                                <div key={o.id} className="card" style={{ marginBottom: 14, padding: 18 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                                        <div>
                                            <div style={{ fontWeight: 950 }}>Order #{o.id}</div>
                                            <div className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                                                Placed on {new Date(o.order_date).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: 18, fontWeight: 950 }}>
                                                ₹{Number(o.total_amount || 0).toFixed(2)}
                                            </div>
                                            <div style={{ marginTop: 8 }}>
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        padding: '6px 10px',
                                                        borderRadius: 999,
                                                        fontSize: 12,
                                                        fontWeight: 900,
                                                        background: tone.bg,
                                                        color: tone.fg,
                                                        border: `1px solid ${tone.border}`,
                                                    }}
                                                >
                                                    {String(o.status || 'pending').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: 16 }}>
                                        <h3 style={{ fontSize: 16, marginBottom: 10 }}>Items</h3>
                                        {o.items?.map((item) => (
                                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0' }}>
                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        style={{
                                                            width: 56,
                                                            height: 56,
                                                            objectFit: 'cover',
                                                            borderRadius: 14,
                                                            border: '1px solid rgba(212,175,55,0.14)',
                                                        }}
                                                    />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 850 }}>{item.name}</div>
                                                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                                                        Qty: {item.quantity} × ₹{Number(item.price || 0).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {o.address_line1 && (
                                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(17,24,39,0.08)', fontSize: 14 }}>
                                            <span style={{ fontWeight: 900 }}>Shipping to:</span>{' '}
                                            <span className="muted">
                                                {o.address_line1}, {o.city}, {o.state}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;


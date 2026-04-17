import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import orderService from '../../services/orderService';

const buildItemPreview = (items = []) => {
    const safeItems = Array.isArray(items) ? items : [];
    const visible = safeItems.slice(0, 3);
    const remaining = Math.max(0, safeItems.length - visible.length);
    return { visible, remaining };
};

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const statusFilter = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const value = String(params.get('status') || '').trim().toLowerCase();
        return value || null;
    }, [location.search]);

    const filteredOrders = useMemo(() => {
        if (!statusFilter) return orders;
        return orders.filter((o) => String(o.status || '').toLowerCase() === statusFilter);
    }, [orders, statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await orderService.getAllOrders();
            setOrders(data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            toast.success('Order status updated');
            fetchOrders();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ textAlign: 'left', marginBottom: 20 }}>
                        {statusFilter ? `${statusFilter.toUpperCase()} Orders` : 'All Orders'}
                    </h2>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <Link className="btn" to="/admin/orders">
                            All
                        </Link>
                        <Link className="btn" to="/admin/orders?status=pending">
                            Pending
                        </Link>
                        <Link className="btn" to="/admin/orders?status=confirmed">
                            Confirmed
                        </Link>
                        <Link className="btn" to="/admin/orders?status=shipped">
                            Shipped
                        </Link>
                        <Link className="btn" to="/admin/orders?status=delivered">
                            Delivered
                        </Link>
                        <Link className="btn" to="/admin/orders?status=cancelled">
                            Cancelled
                        </Link>
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'left' }}>No orders found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table style={{ width: '100%', background: 'white', borderRadius: 10, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: 12 }}>Order ID</th>
                                    <th style={{ padding: 12 }}>Customer</th>
                                    <th style={{ padding: 12, minWidth: 260 }}>Products</th>
                                    <th style={{ padding: 12 }}>Total</th>
                                    <th style={{ padding: 12 }}>Status</th>
                                    <th style={{ padding: 12 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((o) => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 12 }}>#{o.id}</td>
                                        <td style={{ padding: 12 }}>{o.user_name} ({o.email})</td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {buildItemPreview(o.items).visible.length === 0 ? (
                                                    <span className="muted">-</span>
                                                ) : (
                                                    buildItemPreview(o.items).visible.map((item) => (
                                                        <div
                                                            key={item.id || `${o.id}-${item.product_id}`}
                                                            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                                                        >
                                                            <img
                                                                src={item.image_url || 'https://via.placeholder.com/64x64?text=Prime+Bags'}
                                                                alt={item.name || 'Product'}
                                                                style={{
                                                                    width: 44,
                                                                    height: 44,
                                                                    objectFit: 'cover',
                                                                    borderRadius: 10,
                                                                    border: '1px solid #eee',
                                                                    background: '#fafafa',
                                                                }}
                                                                loading="lazy"
                                                            />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <Link
                                                                    to={`/admin/edit-product/${item.product_id}`}
                                                                    style={{ color: '#0b5ed7', textDecoration: 'none' }}
                                                                >
                                                                    {item.name || `Product #${item.product_id}`}
                                                                </Link>
                                                                <span className="muted" style={{ fontSize: 13 }}>
                                                                    Qty: {item.quantity} • ₹{Number(item.price || 0).toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                                {buildItemPreview(o.items).remaining > 0 ? (
                                                    <span className="muted" style={{ fontSize: 13 }}>
                                                        +{buildItemPreview(o.items).remaining} more item
                                                        {buildItemPreview(o.items).remaining > 1 ? 's' : ''}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </td>
                                        <td style={{ padding: 12 }}>₹{Number(o.total_amount || 0).toFixed(2)}</td>
                                        <td style={{ padding: 12 }}>
                                            <span style={{ 
                                                padding: '4px 8px', 
                                                borderRadius: '4px',
                                                background: o.status === 'pending' ? '#fff3cd' : o.status === 'delivered' ? '#d4edda' : o.status === 'cancelled' ? '#f8d7da' : '#e2e3e5',
                                                color: o.status === 'pending' ? '#856404' : o.status === 'delivered' ? '#155724' : o.status === 'cancelled' ? '#721c24' : '#383d41'
                                            }}>
                                                {String(o.status || '').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: 12 }}>
                                            <select 
                                                value={o.status}
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                className="btn"
                                                style={{ padding: '6px', fontSize: '14px' }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default OrdersList;

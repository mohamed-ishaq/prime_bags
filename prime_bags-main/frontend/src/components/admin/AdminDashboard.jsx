import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';
import orderService from '../../services/orderService';
import reviewService from '../../services/reviewService';

const StatCard = ({ title, value, linkTo, linkLabel }) => {
    return (
        <div className="card" style={{ padding: 22, textAlign: 'left' }}>
            <h3 style={{ marginBottom: 8 }}>{title}</h3>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{value}</div>
            {linkTo ? (
                <Link className="btn btn-primary" to={linkTo} style={{ display: 'inline-block' }}>
                    {linkLabel}
                </Link>
            ) : null}
        </div>
    );
};

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsData, ordersData] = await Promise.all([
                    productService.getProducts(),
                    orderService.getAllOrders(),
                ]);
                setProducts(productsData || []);
                setOrders(ordersData || []);
                const reviewsData = await reviewService.getAllReviews().catch(() => []);
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const stats = useMemo(() => {
        const pending = orders.filter((o) => o.status === 'pending').length;
        const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
        return {
            products: products.length,
            orders: orders.length,
            pending,
            revenue,
            reviews: reviews.length,
        };
    }, [orders, products.length, reviews.length]);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ textAlign: 'left' }}>Admin Dashboard</h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Link className="btn btn-primary" to="/admin/add-product">
                            Add Product
                        </Link>
                        <Link className="btn btn-success" to="/admin/orders">
                            View Orders
                        </Link>
                        <Link className="btn" to="/admin/reviews">
                            Reviews
                        </Link>
                    </div>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: 20,
                        marginTop: 20,
                    }}
                >
                    <StatCard title="Total Products" value={stats.products} linkTo="/admin/products" linkLabel="Manage Products" />
                    <StatCard title="Total Orders" value={stats.orders} linkTo="/admin/orders" linkLabel="Manage Orders" />
                    <StatCard title="Pending Orders" value={stats.pending} linkTo="/admin/orders?status=pending" linkLabel="Review Pending" />
                    <StatCard title="Total Reviews" value={stats.reviews} linkTo="/admin/reviews" linkLabel="View Reviews" />
                    <StatCard title="Revenue (All Orders)" value={`₹${stats.revenue.toFixed(2)}`} />
                </div>
            </div>
        </>
    );
};

export default AdminDashboard;

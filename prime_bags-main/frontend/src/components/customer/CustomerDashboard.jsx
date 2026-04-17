import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { useAuth } from '../../context/AuthContext';

const CustomerDashboard = () => {
    const { user } = useAuth();

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
                <h2 style={{ textAlign: 'left', marginBottom: 20 }}>My Dashboard</h2>
                <div style={{ marginBottom: 30, textAlign: 'left' }}>
                    <h4>Welcome back, {user?.name || 'Customer'}!</h4>
                    <p className="muted">From your account dashboard you can view your recent orders and manage your shipping addresses.</p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 20,
                    }}
                >
                    <div className="card" style={{ padding: 30, textAlign: 'center' }}>
                        <h3>My Orders</h3>
                        <p className="muted" style={{ margin: '15px 0' }}>View and track your previous orders</p>
                        <Link className="btn btn-primary" to="/customer/orders">
                            View Orders
                        </Link>
                    </div>

                    <div className="card" style={{ padding: 30, textAlign: 'center' }}>
                        <h3>My Addresses</h3>
                        <p className="muted" style={{ margin: '15px 0' }}>Manage your shipping addresses</p>
                        <Link className="btn btn-primary" to="/customer/addresses">
                            Manage Addresses
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CustomerDashboard;

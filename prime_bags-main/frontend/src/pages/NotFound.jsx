import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const NotFound = () => {
    return (
        <>
            <Navbar />
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                padding: '50px'
            }}>
                <h1 style={{ fontSize: '100px', color: '#007bff' }}>404</h1>
                <h2>Page Not Found</h2>
                <p>The page you're looking for doesn't exist or has been moved.</p>
                <Link to="/">
                    <button className="btn btn-primary" style={{ marginTop: '20px' }}>
                        Go Back Home
                    </button>
                </Link>
            </div>
            <Footer />
        </>
    );
};

export default NotFound;
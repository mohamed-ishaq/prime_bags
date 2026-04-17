import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const LikedProducts = () => {
    return (
        <>
            <Navbar />
            <div className="container page" style={{ textAlign: 'left' }}>
                <h2>Liked Products</h2>
                <div className="card" style={{ padding: 18, marginTop: 16 }}>
                    <p className="muted">Coming soon: your wishlist/liked items will appear here.</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LikedProducts;


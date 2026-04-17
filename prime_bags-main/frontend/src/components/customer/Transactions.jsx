import React from 'react';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';

const Transactions = () => {
    return (
        <>
            <Navbar />
            <div className="container page" style={{ textAlign: 'left' }}>
                <h2>Transactions</h2>
                <div className="card" style={{ padding: 18, marginTop: 16 }}>
                    <p className="muted">Coming soon: payment and transaction history will appear here.</p>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Transactions;


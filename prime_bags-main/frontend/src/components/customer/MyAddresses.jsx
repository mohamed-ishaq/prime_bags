import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../services/api';

const emptyAddress = (fullName = '') => ({
    full_name: fullName,
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    is_default: false,
});

const MyAddresses = () => {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState(emptyAddress(''));

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/addresses');
            setAddresses(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewAddress((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/addresses', newAddress);
            toast.success('Address added successfully');
            setShowAddForm(false);
            setNewAddress(emptyAddress(newAddress.full_name || ''));
            fetchAddresses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add address');
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Delete this address?');
        if (!confirmed) return;

        try {
            await api.delete(`/users/addresses/${id}`);
            toast.success('Address deleted');
            setAddresses((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete address');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container page" style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <h2>My Addresses</h2>
                    <button className="btn btn-primary" onClick={() => setShowAddForm((v) => !v)}>
                        {showAddForm ? 'Cancel' : 'Add New Address'}
                    </button>
                </div>

                {showAddForm && (
                    <div className="card" style={{ padding: 18, marginTop: 16 }}>
                        <h3>Add New Address</h3>
                        <form onSubmit={handleAddAddress} style={{ marginTop: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Full Name</label>
                                    <input name="full_name" value={newAddress.full_name} onChange={handleChange} required className="input" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Address Line 1</label>
                                    <input name="address_line1" value={newAddress.address_line1} onChange={handleChange} required className="input" />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label className="label">Address Line 2</label>
                                    <input name="address_line2" value={newAddress.address_line2} onChange={handleChange} className="input" />
                                </div>
                                <div>
                                    <label className="label">City</label>
                                    <input name="city" value={newAddress.city} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">State</label>
                                    <input name="state" value={newAddress.state} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Pincode</label>
                                    <input name="pincode" value={newAddress.pincode} onChange={handleChange} required className="input" />
                                </div>
                                <div>
                                    <label className="label">Phone</label>
                                    <input name="phone" value={newAddress.phone} onChange={handleChange} required className="input" />
                                </div>
                            </div>

                            <label style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input type="checkbox" name="is_default" checked={newAddress.is_default} onChange={handleChange} />
                                <span className="muted" style={{ fontWeight: 750 }}>
                                    Set as default address
                                </span>
                            </label>

                            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                                <button type="submit" className="btn btn-primary">
                                    Save Address
                                </button>
                                <button type="button" className="btn" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {addresses.length === 0 ? (
                    <div className="card" style={{ padding: 18, marginTop: 16 }}>
                        <p className="muted">You have no saved addresses.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginTop: 16 }}>
                        {addresses.map((a) => (
                            <div key={a.id} className="card" style={{ padding: 18 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                    <div>
                                        <div style={{ fontWeight: 950 }}>{a.full_name}</div>
                                        <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                                            <div>{a.address_line1}</div>
                                            {a.address_line2 && <div>{a.address_line2}</div>}
                                            <div>
                                                {a.city}, {a.state} {a.pincode}
                                            </div>
                                            <div>Phone: {a.phone}</div>
                                        </div>
                                    </div>
                                    {a.is_default ? (
                                        <span
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: 999,
                                                fontSize: 12,
                                                fontWeight: 900,
                                                background: 'rgba(212,175,55,0.16)',
                                                border: '1px solid rgba(212,175,55,0.28)',
                                            }}
                                        >
                                            Default
                                        </span>
                                    ) : null}
                                </div>

                                <div style={{ marginTop: 14 }}>
                                    <button className="btn btn-danger" onClick={() => handleDelete(a.id)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default MyAddresses;


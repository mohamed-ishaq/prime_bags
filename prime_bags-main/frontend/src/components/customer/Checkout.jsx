import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import orderService from '../../services/orderService';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cart, clearCart, loading } = useCart();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [cardDetails, setCardDetails] = useState({
        cardholderName: '',
        cardNumber: '',
        expiry: '',
        cvv: '',
    });
    const [newAddress, setNewAddress] = useState({
        full_name: user?.name || '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        is_default: false
    });

    const sanitizeCardNumber = (value) => String(value || '').replace(/\D/g, '').slice(0, 19);

    const sanitizeExpiry = (value) => {
        const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const isValidExpiry = (value) => {
        const match = String(value || '').match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        const month = Number(match[1]);
        if (month < 1 || month > 12) return false;
        return true;
    };

    const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        if (cart.items?.length === 0 && !loading) {
            navigate('/customer/cart');
        }
    }, [cart, loading, navigate]);

    const fetchAddresses = async () => {
        try {
            const response = await api.get('/users/addresses');
            setAddresses(response.data);
            const defaultAddress = response.data.find(addr => addr.is_default);
            if (defaultAddress) {
                setSelectedAddress(defaultAddress.id);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            await api.post('/users/addresses', newAddress);
            toast.success('Address added successfully');
            setShowAddressForm(false);
            fetchAddresses();
            setNewAddress({
                full_name: user?.name || '',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                pincode: '',
                phone: '',
                is_default: false
            });
        } catch (error) {
            toast.error('Failed to add address');
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select or add an address');
            return;
        }

        if (paymentMethod === 'card') {
            const cardNumber = sanitizeCardNumber(cardDetails.cardNumber);
            const cvv = String(cardDetails.cvv || '').replace(/\D/g, '').slice(0, 4);
            const name = String(cardDetails.cardholderName || '').trim();
            const expiry = String(cardDetails.expiry || '').trim();

            if (!name) {
                toast.error('Please enter the cardholder name');
                return;
            }
            if (cardNumber.length < 13) {
                toast.error('Please enter a valid card number');
                return;
            }
            if (!isValidExpiry(expiry)) {
                toast.error('Please enter a valid expiry (MM/YY)');
                return;
            }
            if (!/^\d{3,4}$/.test(cvv)) {
                toast.error('Please enter a valid CVV');
                return;
            }
        }

        const orderData = {
            items: cart.items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            })),
            total_amount: cart.total,
            payment_method: paymentMethod,
            address_id: selectedAddress
        };

        try {
            await orderService.createOrder(orderData);
            toast.success('Order placed successfully!');
            await clearCart();
            navigate('/customer/orders');
        } catch (error) {
            toast.error('Failed to place order');
        }
    };

    if (loading || !cart.items) {
        return <div className="loading-spinner">Loading...</div>;
    }

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '40px 20px' }}>
                <h1 style={{ marginBottom: '30px' }}>Checkout</h1>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
                    {/* Left Column - Address and Payment */}
                    <div>
                        {/* Address Section */}
                        <div style={{ 
                            backgroundColor: 'white', 
                            padding: '20px', 
                            borderRadius: '10px',
                            marginBottom: '20px'
                        }}>
                            <h2>Shipping Address</h2>
                            {addresses.length > 0 && !showAddressForm && (
                                <div style={{ marginTop: '15px' }}>
                                    {addresses.map(address => (
                                        <div key={address.id} style={{ 
                                            marginBottom: '10px',
                                            padding: '10px',
                                            border: selectedAddress === address.id ? '2px solid #007bff' : '1px solid #ddd',
                                            borderRadius: '5px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => setSelectedAddress(address.id)}
                                        >
                                            <input
                                                type="radio"
                                                checked={selectedAddress === address.id}
                                                onChange={() => setSelectedAddress(address.id)}
                                                style={{ marginRight: '10px' }}
                                            />
                                            <div style={{ display: 'inline-block' }}>
                                                <p><strong>{address.full_name}</strong></p>
                                                <p>{address.address_line1}</p>
                                                {address.address_line2 && <p>{address.address_line2}</p>}
                                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                                <p>Phone: {address.phone}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <button 
                                        className="btn"
                                        onClick={() => setShowAddressForm(true)}
                                        style={{ marginTop: '10px' }}
                                    >
                                        + Add New Address
                                    </button>
                                </div>
                            )}
                            
                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} style={{ marginTop: '15px' }}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newAddress.full_name}
                                        onChange={(e) => setNewAddress({...newAddress, full_name: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 1"
                                        value={newAddress.address_line1}
                                        onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Address Line 2 (Optional)"
                                        value={newAddress.address_line2}
                                        onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})}
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Phone Number"
                                        value={newAddress.phone}
                                        onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                                        required
                                        style={inputStyle}
                                    />
                                    <label style={{ marginBottom: '10px', display: 'block' }}>
                                        <input
                                            type="checkbox"
                                            checked={newAddress.is_default}
                                            onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                                        />
                                        Set as default address
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn btn-primary">Save Address</button>
                                        <button type="button" className="btn" onClick={() => setShowAddressForm(false)}>Cancel</button>
                                    </div>
                                </form>
                            )}
                        </div>
                        
                        {/* Payment Method */}
                        <div style={{ 
                            backgroundColor: 'white', 
                            padding: '20px', 
                            borderRadius: '10px'
                        }}>
                            <h2>Payment Method</h2>
                            <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '10px' }}>
                                    <input
                                        type="radio"
                                        value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    Cash on Delivery
                                </label>
                                <label style={{ display: 'block' }}>
                                    <input
                                        type="radio"
                                        value="card"
                                        checked={paymentMethod === 'card'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{ marginRight: '10px' }}
                                    />
                                    Credit/Debit Card
                                </label>
                            </div>

                            {paymentMethod === 'card' ? (
                                <div style={{ marginTop: 16, background: '#f8f9fa', padding: 14, borderRadius: 10 }}>
                                    <div style={{ fontSize: 13, color: '#555', marginBottom: 10 }}>
                                        Demo card form (details are not stored).
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cardholder Name"
                                        value={cardDetails.cardholderName}
                                        onChange={(e) =>
                                            setCardDetails((prev) => ({ ...prev, cardholderName: e.target.value }))
                                        }
                                        style={inputStyle}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Card Number"
                                        value={cardDetails.cardNumber}
                                        onChange={(e) =>
                                            setCardDetails((prev) => ({
                                                ...prev,
                                                cardNumber: sanitizeCardNumber(e.target.value),
                                            }))
                                        }
                                        style={inputStyle}
                                        inputMode="numeric"
                                    />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <input
                                            type="text"
                                            placeholder="Expiry (MM/YY)"
                                            value={cardDetails.expiry}
                                            onChange={(e) =>
                                                setCardDetails((prev) => ({ ...prev, expiry: sanitizeExpiry(e.target.value) }))
                                            }
                                            style={inputStyle}
                                            inputMode="numeric"
                                        />
                                        <input
                                            type="password"
                                            placeholder="CVV"
                                            value={cardDetails.cvv}
                                            onChange={(e) =>
                                                setCardDetails((prev) => ({
                                                    ...prev,
                                                    cvv: String(e.target.value || '').replace(/\\D/g, '').slice(0, 4),
                                                }))
                                            }
                                            style={inputStyle}
                                            inputMode="numeric"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    
                    {/* Right Column - Order Summary */}
                    <div style={{ 
                        backgroundColor: '#f8f9fa', 
                        padding: '20px', 
                        borderRadius: '10px',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <h2>Order Summary</h2>
                        {cart.items.map(item => (
                            <div key={item.product_id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '10px',
                                padding: '10px 0',
                                borderBottom: '1px solid #ddd'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                    <img
                                        src={item.image_url || 'https://via.placeholder.com/48x48?text=Bag'}
                                        alt={item.name}
                                        style={{
                                            width: 48,
                                            height: 48,
                                            objectFit: 'cover',
                                            borderRadius: 10,
                                            border: '1px solid #e5e7eb',
                                        }}
                                        loading="lazy"
                                    />
                                    <div style={{ minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            Qty {item.quantity} • {formatCurrency(item.price)}
                                        </div>
                                    </div>
                                </div>
                                <span style={{ fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</span>
                            </div>
                        ))}
                        <div style={{ margin: '20px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Subtotal:</span>
                                <span>{formatCurrency(cart.total)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span>Shipping:</span>
                                <span>Free</span>
                            </div>
                            <hr />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
                                <span>Total:</span>
                                <span>{formatCurrency(cart.total)}</span>
                            </div>
                        </div>

                        {paymentMethod === 'card' ? (
                            <div style={{ marginTop: 10, fontSize: 13, color: '#555' }}>
                                Payment: Card • **** {sanitizeCardNumber(cardDetails.cardNumber).slice(-4) || '0000'}
                            </div>
                        ) : (
                            <div style={{ marginTop: 10, fontSize: 13, color: '#555' }}>Payment: Cash on Delivery</div>
                        )}
                        <button 
                            className="btn btn-success"
                            onClick={handlePlaceOrder}
                            style={{ width: '100%', padding: '12px' }}
                        >
                            Place Order
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
};

export default Checkout;

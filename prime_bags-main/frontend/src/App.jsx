import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import PrivateRoute from './components/auth/PrivateRoute';
import RootRedirect from './components/auth/RootRedirect';
import Login from './components/auth/Login';
import Homepage from './components/customer/Homepage';
import ProductDetail from './components/customer/ProductDetail';
import Cart from './components/customer/Cart';
import Checkout from './components/customer/Checkout';
import CustomerDashboard from './components/customer/CustomerDashboard';
import MyOrders from './components/customer/MyOrders';
import MyAddresses from './components/customer/MyAddresses';
import LikedProducts from './components/customer/LikedProducts';
import Transactions from './components/customer/Transactions';
import AdminDashboard from './components/admin/AdminDashboard';
import AddProduct from './components/admin/AddProduct';
import ProductList from './components/admin/ProductList';
import OrdersList from './components/admin/OrdersList';
import EditProduct from './components/admin/EditProduct';
import ReviewsList from './components/admin/ReviewsList';
import NotFound from './pages/NotFound';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Toaster position="top-right" />
                    <Routes>
                        <Route path="/" element={<RootRedirect />} />
                        <Route path="/login" element={<Login />} />
                        
                        {/* Customer Routes */}
                        <Route path="/customer" element={<PrivateRoute role="customer"><Homepage /></PrivateRoute>} />
                        <Route path="/customer/product/:id" element={<PrivateRoute role="customer"><ProductDetail /></PrivateRoute>} />
                        <Route path="/customer/cart" element={<PrivateRoute role="customer"><Cart /></PrivateRoute>} />
                        <Route path="/customer/checkout" element={<PrivateRoute role="customer"><Checkout /></PrivateRoute>} />
                        <Route path="/customer/dashboard" element={<PrivateRoute role="customer"><CustomerDashboard /></PrivateRoute>} />
                        <Route path="/customer/orders" element={<PrivateRoute role="customer"><MyOrders /></PrivateRoute>} />
                        <Route path="/customer/addresses" element={<PrivateRoute role="customer"><MyAddresses /></PrivateRoute>} />
                        <Route path="/customer/liked" element={<PrivateRoute role="customer"><LikedProducts /></PrivateRoute>} />
                        <Route path="/customer/transactions" element={<PrivateRoute role="customer"><Transactions /></PrivateRoute>} />
                        
                        {/* Admin Routes */}
                        <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                        <Route path="/admin/add-product" element={<PrivateRoute role="admin"><AddProduct /></PrivateRoute>} />
                        <Route path="/admin/products" element={<PrivateRoute role="admin"><ProductList /></PrivateRoute>} />
                        <Route path="/admin/orders" element={<PrivateRoute role="admin"><OrdersList /></PrivateRoute>} />
                        <Route path="/admin/reviews" element={<PrivateRoute role="admin"><ReviewsList /></PrivateRoute>} />
                        <Route path="/admin/edit-product/:id" element={<PrivateRoute role="admin"><EditProduct /></PrivateRoute>} />
                        
                        <Route path="/404" element={<NotFound />} />
                        <Route path="*" element={<Navigate to="/404" />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;

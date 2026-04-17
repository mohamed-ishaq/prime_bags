import React, { createContext, useState, useContext, useEffect } from 'react';
import cartService from '../services/cartService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const loadCart = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await cartService.getCart();
            setCart(data);
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadCart();
        } else {
            setCart({ items: [], total: 0 });
        }
    }, [user]);

    const addToCart = async (product_id, quantity = 1) => {
        try {
            await cartService.addToCart(product_id, quantity);
            await loadCart();
            toast.success('Added to cart!');
        } catch (error) {
            toast.error('Failed to add to cart');
            console.error(error);
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            await cartService.updateCartItem(productId, quantity);
            await loadCart();
        } catch (error) {
            toast.error('Failed to update cart');
            console.error(error);
        }
    };

    const removeItem = async (productId) => {
        try {
            await cartService.removeFromCart(productId);
            await loadCart();
            toast.success('Removed from cart');
        } catch (error) {
            toast.error('Failed to remove item');
            console.error(error);
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            await loadCart();
        } catch (error) {
            console.error(error);
        }
    };

    const value = {
        cart,
        loading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        loadCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
import api from './api';

const getCart = async () => {
    const response = await api.get('/cart');
    return response.data;
};

const addToCart = async (product_id, quantity = 1) => {
    const response = await api.post('/cart/add', { product_id, quantity });
    return response.data;
};

const updateCartItem = async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
};

const removeFromCart = async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
};

const clearCart = async () => {
    const response = await api.delete('/cart');
    return response.data;
};

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};

export default cartService;
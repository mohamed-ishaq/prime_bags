import api from './api';

const createOrder = async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
};

const getUserOrders = async () => {
    const response = await api.get('/orders/myorders');
    return response.data;
};

const getAllOrders = async () => {
    const response = await api.get('/orders/all');
    return response.data;
};

const updateOrderStatus = async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
};

const orderService = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
};

export default orderService;
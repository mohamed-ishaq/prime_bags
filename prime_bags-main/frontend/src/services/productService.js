import api from './api';

const getProducts = async (category = null) => {
    const url = category ? `/products?category=${category}` : '/products';
    const response = await api.get(url);
    return response.data;
};

const getProductById = async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
};

const getCategories = async () => {
    const response = await api.get('/products/categories');
    return response.data;
};

const getProductReviews = async (productId) => {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
};

const upsertProductReview = async (productId, review) => {
    const response = await api.post(`/products/${productId}/reviews`, review);
    return response.data;
};

const createProduct = async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
};

const updateProduct = async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
};

const deleteProduct = async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
};

const productService = {
    getProducts,
    getProductById,
    getCategories,
    getProductReviews,
    upsertProductReview,
    createProduct,
    updateProduct,
    deleteProduct,
};

export default productService;

// This file is for route configuration if needed
// We're using direct routes in App.jsx
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    CUSTOMER: {
        HOME: '/customer',
        PRODUCT_DETAIL: '/customer/product/:id',
        CART: '/customer/cart',
        CHECKOUT: '/customer/checkout',
        DASHBOARD: '/customer/dashboard',
        ORDERS: '/customer/orders',
        ADDRESSES: '/customer/addresses'
    },
    ADMIN: {
        DASHBOARD: '/admin',
        ADD_PRODUCT: '/admin/add-product',
        PRODUCTS: '/admin/products',
        ORDERS: '/admin/orders',
        REVIEWS: '/admin/reviews',
        EDIT_PRODUCT: '/admin/edit-product/:id'
    }
};

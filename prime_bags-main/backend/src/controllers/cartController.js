const db = require('../config/database');

// Get cart
const getCart = async (req, res) => {
    try {
        const [cart] = await db.query(
            `SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity 
             FROM cart c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.user_id = ?`,
            [req.user.id]
        );
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        res.json({ items: cart, total });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add to cart
const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;
        const user_id = req.user.id;
        
        // Check if product exists
        const [product] = await db.query('SELECT * FROM products WHERE id = ?', [product_id]);
        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if already in cart
        const [existing] = await db.query(
            'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
        );
        
        if (existing.length > 0) {
            await db.query(
                'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
                [quantity, user_id, product_id]
            );
        } else {
            await db.query(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [user_id, product_id, quantity]
            );
        }
        
        res.status(201).json({ message: 'Added to cart successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update cart item
const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        await db.query(
            'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
            [quantity, req.user.id, req.params.productId]
        );
        res.json({ message: 'Cart updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Remove from cart
const removeFromCart = async (req, res) => {
    try {
        await db.query(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [req.user.id, req.params.productId]
        );
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    try {
        await db.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};
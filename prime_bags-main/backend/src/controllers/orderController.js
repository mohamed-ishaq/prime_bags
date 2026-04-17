const db = require('../config/database');

// Create order
const createOrder = async (req, res) => {
    try {
        const { items, total_amount, payment_method, address_id } = req.body;
        const user_id = req.user.id;
        
        // Start transaction
        const connection = await db.getConnection();
        await connection.beginTransaction();
        
        try {
            // Create order
            const [orderResult] = await connection.query(
                'INSERT INTO orders (user_id, total_amount, payment_method, address_id, status, payment_status) VALUES (?, ?, ?, ?, ?, ?)',
                [user_id, total_amount, payment_method, address_id, 'pending', 'pending']
            );
            
            const order_id = orderResult.insertId;
            
            // Add order items
            for (const item of items) {
                await connection.query(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [order_id, item.product_id, item.quantity, item.price]
                );
                
                // Update stock
                await connection.query(
                    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                    [item.quantity, item.product_id]
                );
            }
            
            // Clear cart
            await connection.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
            
            await connection.commit();
            
            res.status(201).json({ 
                message: 'Order created successfully', 
                order_id,
                order: { id: order_id, total_amount, status: 'pending' }
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user orders
const getUserOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, a.address_line1, a.city, a.state 
             FROM orders o 
             LEFT JOIN addresses a ON o.address_id = a.id 
             WHERE o.user_id = ? 
             ORDER BY o.order_date DESC`,
            [req.user.id]
        );
        
        // Get items for each order
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.image_url 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, u.name as user_name, u.email, a.address_line1, a.city, a.state 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             LEFT JOIN addresses a ON o.address_id = a.id 
             ORDER BY o.order_date DESC`
        );
        
        for (let order of orders) {
            const [items] = await db.query(
                `SELECT oi.*, p.name, p.image_url 
                 FROM order_items oi 
                 JOIN products p ON oi.product_id = p.id 
                 WHERE oi.order_id = ?`,
                [order.id]
            );
            order.items = items;
        }
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus
};
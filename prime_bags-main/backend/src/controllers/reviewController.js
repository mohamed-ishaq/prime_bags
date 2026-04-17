const db = require('../config/database');

const clampRating = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return null;
    const rounded = Math.round(numeric);
    if (rounded < 1 || rounded > 5) return null;
    return rounded;
};

const getProductReviews = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isFinite(productId)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const [reviews] = await db.query(
            `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
                    u.name as user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ?
             ORDER BY r.created_at DESC`,
            [productId]
        );

        res.json(reviews || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const upsertProductReview = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        if (!Number.isFinite(productId)) {
            return res.status(400).json({ message: 'Invalid product id' });
        }

        const rating = clampRating(req.body?.rating);
        const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim() : '';

        if (!rating) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        const [products] = await db.query('SELECT id FROM products WHERE id = ?', [productId]);
        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await db.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment)`,
            [productId, userId, rating, comment || null]
        );

        const [updated] = await db.query(
            `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
                    u.name as user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = ? AND r.user_id = ?`,
            [productId, userId]
        );

        res.status(201).json(updated?.[0] || { message: 'Review saved' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllReviews = async (req, res) => {
    try {
        const [reviews] = await db.query(
            `SELECT r.id, r.product_id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
                    u.name as user_name, u.email as user_email,
                    p.name as product_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             JOIN products p ON r.product_id = p.id
             ORDER BY r.created_at DESC`
        );

        res.json(reviews || []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProductReviews,
    upsertProductReview,
    getAllReviews,
};


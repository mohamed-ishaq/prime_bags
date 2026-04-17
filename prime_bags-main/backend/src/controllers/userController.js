const db = require('../config/database');

// Get user addresses
const getAddresses = async (req, res) => {
    try {
        const [addresses] = await db.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC',
            [req.user.id]
        );
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add address
const addAddress = async (req, res) => {
    try {
        const { full_name, address_line1, address_line2, city, state, pincode, phone, is_default } = req.body;
        
        if (is_default) {
            await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
        }
        
        const [result] = await db.query(
            'INSERT INTO addresses (user_id, full_name, address_line1, address_line2, city, state, pincode, phone, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, full_name, address_line1, address_line2, city, state, pincode, phone, is_default || false]
        );
        
        res.status(201).json({ id: result.insertId, message: 'Address added successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const { full_name, address_line1, address_line2, city, state, pincode, phone, is_default } = req.body;
        
        if (is_default) {
            await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = ?', [req.user.id]);
        }
        
        await db.query(
            'UPDATE addresses SET full_name = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, phone = ?, is_default = ? WHERE id = ? AND user_id = ?',
            [full_name, address_line1, address_line2, city, state, pincode, phone, is_default || false, req.params.id, req.user.id]
        );
        
        res.json({ message: 'Address updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const generateToken = require('../utils/generateToken');

const DEMO_USERS = [
    {
        name: 'Admin',
        email: 'admin@primebags.com',
        role: 'admin',
        password: process.env.DEMO_ADMIN_PASSWORD || 'PrimeBagsAdmin#2026',
    },
    {
        name: 'John Doe',
        email: 'customer@example.com',
        role: 'customer',
        password: process.env.DEMO_CUSTOMER_PASSWORD || 'PrimeBagsCustomer#2026',
    },
];

const isDemoSeedAllowed = () => {
    if (process.env.NODE_ENV === 'production') return false;
    return (process.env.ALLOW_DEMO_SEED || 'true').toLowerCase() === 'true';
};

const getDemoUserByEmail = (email) => {
    if (!email) return null;
    return DEMO_USERS.find((u) => u.email.toLowerCase() === String(email).toLowerCase()) || null;
};

// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'customer' } = req.body;
        
        // Check if user exists
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );
        
        const token = generateToken(result.insertId, email, role);
        
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        const demoUser = getDemoUserByEmail(email);
        const demoSeedAllowed = isDemoSeedAllowed();

        if (users.length === 0) {
            if (demoSeedAllowed && demoUser && password === demoUser.password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                await db.query(
                    `INSERT INTO users (name, email, password, role)
                     VALUES (?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE
                         name = VALUES(name),
                         password = VALUES(password),
                         role = VALUES(role)`,
                    [demoUser.name, demoUser.email, hashedPassword, demoUser.role]
                );

                const [seededUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
                if (seededUsers.length === 0) {
                    return res.status(500).json({ message: 'Failed to seed demo user' });
                }

                const seeded = seededUsers[0];
                const token = generateToken(seeded.id, seeded.email, seeded.role);
                return res.json({
                    id: seeded.id,
                    name: seeded.name,
                    email: seeded.email,
                    role: seeded.role,
                    token,
                });
            }

            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        let isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch && demoSeedAllowed && demoUser && password === demoUser.password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                'UPDATE users SET password = ?, role = ?, name = ? WHERE id = ?',
                [hashedPassword, demoUser.role, demoUser.name, user.id]
            );

            user.role = demoUser.role;
            user.name = demoUser.name;
            isMatch = true;
        }

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = generateToken(user.id, user.email, user.role);
        
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user profile
const getProfile = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { register, login, getProfile };

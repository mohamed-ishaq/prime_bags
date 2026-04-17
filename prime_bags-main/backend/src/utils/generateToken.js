const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/auth');

const generateToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, jwtSecret, {
        expiresIn: jwtExpire,
    });
};

module.exports = generateToken;
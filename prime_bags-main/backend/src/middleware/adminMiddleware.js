// The admin middleware logic was originally merged directly into authMiddleware.js.
// We export it from here to maintain backwards compatibility if imported directly from this file.
const { admin } = require('./authMiddleware');

module.exports = {
    admin
};

class User {
    /**
     * @param {Object} user
     * @param {number} user.id
     * @param {string} user.name
     * @param {string} user.email
     * @param {string} [user.password]
     * @param {string} user.role
     * @param {Date} [user.created_at]
     */
    constructor({ id, name, email, password, role, created_at }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role || 'customer';
        this.created_at = created_at;
    }
}

module.exports = User;

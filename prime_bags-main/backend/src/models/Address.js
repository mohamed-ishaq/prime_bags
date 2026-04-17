class Address {
    /**
     * @param {Object} address
     * @param {number} address.id
     * @param {number} address.user_id
     * @param {string} address.address_line1
     * @param {string} [address.address_line2]
     * @param {string} address.city
     * @param {string} address.state
     * @param {string} address.country
     * @param {string} address.postal_code
     * @param {boolean} [address.is_default]
     * @param {Date} [address.created_at]
     */
    constructor({ id, user_id, address_line1, address_line2, city, state, country, postal_code, is_default, created_at }) {
        this.id = id;
        this.user_id = user_id;
        this.address_line1 = address_line1;
        this.address_line2 = address_line2;
        this.city = city;
        this.state = state;
        this.country = country || 'India';
        this.postal_code = postal_code;
        this.is_default = is_default || false;
        this.created_at = created_at;
    }
}

module.exports = Address;

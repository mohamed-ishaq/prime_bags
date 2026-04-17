class Cart {
    /**
     * @param {Object} cart
     * @param {number} cart.id
     * @param {number} cart.user_id
     * @param {number} cart.product_id
     * @param {number} cart.quantity
     * @param {Date} [cart.added_at]
     */
    constructor({ id, user_id, product_id, quantity, added_at }) {
        this.id = id;
        this.user_id = user_id;
        this.product_id = product_id;
        this.quantity = quantity;
        this.added_at = added_at;
    }
}

module.exports = Cart;

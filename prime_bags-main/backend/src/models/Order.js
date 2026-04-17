class Order {
    /**
     * @param {Object} order
     * @param {number} order.id
     * @param {number} order.user_id
     * @param {number} order.total_amount
     * @param {string} order.payment_method
     * @param {number} order.address_id
     * @param {string} order.status
     * @param {string} order.payment_status
     * @param {Date} [order.order_date]
     */
    constructor({ id, user_id, total_amount, payment_method, address_id, status, payment_status, order_date }) {
        this.id = id;
        this.user_id = user_id;
        this.total_amount = total_amount;
        this.payment_method = payment_method;
        this.address_id = address_id;
        this.status = status || 'pending';
        this.payment_status = payment_status || 'pending';
        this.order_date = order_date;
    }
}

module.exports = Order;

class OrderItem {
    /**
     * @param {Object} item
     * @param {number} item.id
     * @param {number} item.order_id
     * @param {number} item.product_id
     * @param {number} item.quantity
     * @param {number} item.price
     */
    constructor({ id, order_id, product_id, quantity, price }) {
        this.id = id;
        this.order_id = order_id;
        this.product_id = product_id;
        this.quantity = quantity;
        this.price = price;
    }
}

module.exports = OrderItem;

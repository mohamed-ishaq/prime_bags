class Product {
    /**
     * @param {Object} product
     * @param {number} product.id
     * @param {string} product.name
     * @param {string} product.description
     * @param {number} product.price
     * @param {number} product.category_id
     * @param {number} product.stock_quantity
     * @param {string} [product.image_url]
     * @param {Object} [product.specifications]
     * @param {Date} [product.created_at]
     */
    constructor({ id, name, description, price, category_id, stock_quantity, image_url, specifications, created_at }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category_id = category_id;
        this.stock_quantity = stock_quantity;
        this.image_url = image_url;
        this.specifications = specifications || {};
        this.created_at = created_at;
    }
}

module.exports = Product;

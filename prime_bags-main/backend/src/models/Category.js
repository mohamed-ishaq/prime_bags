class Category {
    /**
     * @param {Object} category
     * @param {number} category.id
     * @param {string} category.name
     * @param {string} [category.description]
     * @param {Date} [category.created_at]
     */
    constructor({ id, name, description, created_at }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.created_at = created_at;
    }
}

module.exports = Category;

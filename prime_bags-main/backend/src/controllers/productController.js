const db = require('../config/database');

const STANDARD_OPTIONS = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const normalizeStandard = (value) => {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (!raw) return null;

    const upper = raw.toUpperCase();
    if (upper === 'LKG' || upper === 'UKG') return upper;

    const digitsMatch = upper.match(/\b(1[0-2]|[1-9])\b/);
    if (digitsMatch) return String(Number(digitsMatch[1]));

    return null;
};

const normalizeImageUrls = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((v) => (typeof v === 'string' ? v.trim() : ''))
            .filter(Boolean)
            .slice(0, 5);
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        return [trimmed];
    }

    return [];
};

const isMissingImageUrlsColumn = (error) => {
    const message = String(error?.sqlMessage || error?.message || '');
    return error?.code === 'ER_BAD_FIELD_ERROR' && /image_urls/i.test(message);
};

const isMissingStandardColumn = (error) => {
    const message = String(error?.sqlMessage || error?.message || '');
    return error?.code === 'ER_BAD_FIELD_ERROR' && /standard/i.test(message);
};

const extractStandard = (row) => {
    if (!row) return null;
    if (row.standard !== undefined && row.standard !== null && String(row.standard).trim()) {
        return normalizeStandard(row.standard) || String(row.standard).trim();
    }

    const specs = row.specifications;
    if (!specs) return null;

    try {
        const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
        const fromSpecs = parsedSpecs?.standard;
        if (fromSpecs === undefined || fromSpecs === null) return null;
        return normalizeStandard(fromSpecs) || String(fromSpecs).trim() || null;
    } catch {
        return null;
    }
};

const extractImageUrls = (row) => {
    if (!row) return [];

    const fromColumn = row.image_urls;

    if (Array.isArray(fromColumn)) {
        return fromColumn.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 5);
    }

    if (typeof fromColumn === 'string') {
        const trimmed = fromColumn.trim();
        if (!trimmed) return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 5);
            }
        } catch {
            // ignore
        }
    }

    const specs = row.specifications;
    if (specs) {
        try {
            const parsedSpecs = typeof specs === 'string' ? JSON.parse(specs) : specs;
            const fromSpecs = parsedSpecs?.image_urls;
            if (Array.isArray(fromSpecs)) {
                return fromSpecs.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 5);
            }
            if (typeof fromSpecs === 'string') {
                const normalized = normalizeImageUrls(fromSpecs);
                if (normalized.length) return normalized;
            }
        } catch {
            // ignore
        }
    }

    return normalizeImageUrls(row.image_url);
};

const ensureImageUrlsOnRow = (row) => {
    if (!row) return row;
    const imageUrls = extractImageUrls(row);
    if (!row.image_urls) row.image_urls = imageUrls;
    if (!row.image_url) row.image_url = imageUrls[0] || row.image_url || null;
    return row;
};

const ensureStandardOnRow = (row) => {
    if (!row) return row;
    if (!row.standard) row.standard = extractStandard(row);
    if (row.standard && !STANDARD_OPTIONS.includes(String(row.standard))) {
        row.standard = normalizeStandard(row.standard) || row.standard;
    }
    return row;
};

const ensureClientFieldsOnRow = (row) => ensureStandardOnRow(ensureImageUrlsOnRow(row));

// Get all products
const getProducts = async (req, res) => {
    try {
        const { category } = req.query;
        const standard = normalizeStandard(req.query?.standard);
        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id
        `;
        const params = [];
        const conditions = [];
        
        if (category) {
            conditions.push('c.name = ?');
            params.push(category);
        }

        if (standard) {
            conditions.push('p.standard = ?');
            params.push(standard);
        }

        if (conditions.length) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        query += ' ORDER BY p.created_at DESC';

        try {
            const [products] = await db.query(query, params);
            return res.json((products || []).map(ensureClientFieldsOnRow));
        } catch (error) {
            if (!standard || !isMissingStandardColumn(error)) throw error;

            const fallbackConditions = [];
            const fallbackParams = [];
            if (category) {
                fallbackConditions.push('c.name = ?');
                fallbackParams.push(category);
            }
            fallbackConditions.push(`JSON_UNQUOTE(JSON_EXTRACT(p.specifications, '$.standard')) = ?`);
            fallbackParams.push(standard);

            const fallbackQuery = `
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE ${fallbackConditions.join(' AND ')}
                ORDER BY p.created_at DESC
            `;

            const [products] = await db.query(fallbackQuery, fallbackParams);
            return res.json((products || []).map(ensureClientFieldsOnRow));
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single product
const getProductById = async (req, res) => {
    try {
        const [products] = await db.query(
            'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
            [req.params.id]
        );
        
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(ensureClientFieldsOnRow(products[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
    try {
        const { name, description, price, category_id, stock_quantity, image_url, image_urls, specifications, standard } = req.body;
        const normalizedImageUrls = normalizeImageUrls(image_urls);
        const primaryImageUrl = (typeof image_url === 'string' && image_url.trim()) ? image_url.trim() : (normalizedImageUrls[0] || null);
        const normalizedStandard = normalizeStandard(standard);
        
        let result;
        try {
            const [r] = await db.query(
                'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, image_urls, specifications, standard) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, category_id, stock_quantity, primaryImageUrl, JSON.stringify(normalizedImageUrls), JSON.stringify(specifications || {}), normalizedStandard]
            );
            result = r;
        } catch (error) {
            if (!isMissingImageUrlsColumn(error) && !isMissingStandardColumn(error)) throw error;
            let specsObject = specifications || {};
            if (typeof specsObject === 'string') {
                try {
                    specsObject = JSON.parse(specsObject);
                } catch {
                    specsObject = {};
                }
            }
            if (!specsObject || typeof specsObject !== 'object' || Array.isArray(specsObject)) specsObject = {};
            specsObject.image_urls = normalizedImageUrls;
            if (normalizedStandard) specsObject.standard = normalizedStandard;
            const [r] = await db.query(
                'INSERT INTO products (name, description, price, category_id, stock_quantity, image_url, specifications) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, category_id, stock_quantity, primaryImageUrl, JSON.stringify(specsObject)]
            );
            result = r;
        }
        
        const [newProduct] = await db.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json(ensureClientFieldsOnRow(newProduct[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { name, description, price, category_id, stock_quantity, image_url, image_urls, specifications, standard } = req.body;
        const normalizedImageUrls = normalizeImageUrls(image_urls);
        const primaryImageUrl = (typeof image_url === 'string' && image_url.trim()) ? image_url.trim() : (normalizedImageUrls[0] || null);
        const normalizedStandard = normalizeStandard(standard);
        
        try {
            await db.query(
                'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock_quantity = ?, image_url = ?, image_urls = ?, specifications = ?, standard = ? WHERE id = ?',
                [name, description, price, category_id, stock_quantity, primaryImageUrl, JSON.stringify(normalizedImageUrls), JSON.stringify(specifications || {}), normalizedStandard, req.params.id]
            );
        } catch (error) {
            if (!isMissingImageUrlsColumn(error) && !isMissingStandardColumn(error)) throw error;
            let specsObject = specifications || {};
            if (typeof specsObject === 'string') {
                try {
                    specsObject = JSON.parse(specsObject);
                } catch {
                    specsObject = {};
                }
            }
            if (!specsObject || typeof specsObject !== 'object' || Array.isArray(specsObject)) specsObject = {};
            specsObject.image_urls = normalizedImageUrls;
            if (normalizedStandard) specsObject.standard = normalizedStandard;
            await db.query(
                'UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, stock_quantity = ?, image_url = ?, specifications = ? WHERE id = ?',
                [name, description, price, category_id, stock_quantity, primaryImageUrl, JSON.stringify(specsObject), req.params.id]
            );
        }
        
        const [updatedProduct] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.json(ensureClientFieldsOnRow(updatedProduct[0]));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get categories
const getCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories
};

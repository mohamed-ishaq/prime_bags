import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';

const getPrimaryImageUrl = (product) => {
    if (!product) return null;
    if (Array.isArray(product.image_urls) && product.image_urls.length > 0) return product.image_urls[0];
    if (typeof product.image_urls === 'string') {
        try {
            const parsed = JSON.parse(product.image_urls);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        } catch {
            // ignore
        }
    }
    return product.image_url || null;
};

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Delete this product?');
        if (!confirmed) return;

        try {
            await productService.deleteProduct(id);
            toast.success('Product deleted');
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ textAlign: 'left' }}>Products</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/admin/add-product')}>
                        Add Product
                    </button>
                </div>

                {products.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'left' }}>No products found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table style={{ width: '100%', background: 'white', borderRadius: 10, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: 12, width: 86 }}>Image</th>
                                    <th style={{ padding: 12 }}>Name</th>
                                    <th style={{ padding: 12 }}>Category</th>
                                    <th style={{ padding: 12 }}>Price</th>
                                    <th style={{ padding: 12 }}>Stock</th>
                                    <th style={{ padding: 12, width: 300 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 12 }}>
                                            <img
                                                src={getPrimaryImageUrl(p) || 'https://via.placeholder.com/80x80?text=Prime+Bags'}
                                                alt={p.name}
                                                style={{
                                                    width: 64,
                                                    height: 64,
                                                    objectFit: 'cover',
                                                    borderRadius: 10,
                                                    border: '1px solid #eee',
                                                    background: '#fafafa',
                                                }}
                                                loading="lazy"
                                            />
                                        </td>
                                        <td style={{ padding: 12 }}>{p.name}</td>
                                        <td style={{ padding: 12 }}>{p.category_name || '-'}</td>
                                        <td style={{ padding: 12 }}>₹{Number(p.price || 0).toFixed(2)}</td>
                                        <td style={{ padding: 12 }}>{p.stock_quantity ?? 0}</td>
                                        <td style={{ padding: 12, display: 'flex', gap: 10 }}>
                                            <button
                                                className="btn"
                                                type="button"
                                                onClick={() =>
                                                    window.open(`/customer/product/${p.id}`, '_blank', 'noopener,noreferrer')
                                                }
                                            >
                                                View
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => navigate(`/admin/edit-product/${p.id}`)}
                                            >
                                                Edit
                                            </button>
                                            <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div style={{ marginTop: 16, textAlign: 'left' }}>
                    <button className="btn" onClick={fetchProducts}>
                        Refresh
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProductList;

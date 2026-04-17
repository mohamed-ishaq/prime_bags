import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock_quantity: '',
        image_urls: ['', '', '', '', ''],
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [product, cats] = await Promise.all([
                    productService.getProductById(id),
                    productService.getCategories(),
                ]);
                setCategories(cats || []);
                let imageUrls = [];
                if (Array.isArray(product?.image_urls)) imageUrls = product.image_urls;
                else if (typeof product?.image_urls === 'string') {
                    try {
                        const parsed = JSON.parse(product.image_urls);
                        if (Array.isArray(parsed)) imageUrls = parsed;
                    } catch {
                        imageUrls = [];
                    }
                }
                if (imageUrls.length === 0 && product?.image_url) imageUrls = [product.image_url];
                const padded = [...imageUrls.map((v) => String(v || '').trim()).filter(Boolean).slice(0, 5)];
                while (padded.length < 5) padded.push('');

                setForm({
                    name: product?.name || '',
                    description: product?.description || '',
                    price: product?.price ?? '',
                    category_id: product?.category_id ?? '',
                    stock_quantity: product?.stock_quantity ?? '',
                    image_urls: padded,
                });
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const onChangeImage = (index, value) => {
        setForm((prev) => ({
            ...prev,
            image_urls: prev.image_urls.map((v, i) => (i === index ? value : v)),
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const imageUrls = (form.image_urls || []).map((v) => String(v || '').trim()).filter(Boolean).slice(0, 5);
            const payload = {
                name: form.name.trim(),
                description: form.description,
                price: Number(form.price),
                category_id: form.category_id ? Number(form.category_id) : null,
                stock_quantity: form.stock_quantity === '' ? 0 : Number(form.stock_quantity),
                image_url: imageUrls[0] || null,
                image_urls: imageUrls,
            };
            await productService.updateProduct(id, payload);
            toast.success('Product updated');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40, textAlign: 'left' }}>
                <h2>Edit Product</h2>

                <form onSubmit={onSubmit} className="card" style={{ padding: 20, marginTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label>Name</label>
                            <input name="name" value={form.name} onChange={onChange} required className="input" />
                        </div>
                        <div>
                            <label>Category</label>
                            <select name="category_id" value={form.category_id} onChange={onChange} className="input">
                                <option value="">Select</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Price</label>
                            <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} required className="input" />
                        </div>
                        <div>
                            <label>Stock Quantity</label>
                            <input name="stock_quantity" type="number" value={form.stock_quantity} onChange={onChange} className="input" />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Product Images (up to 5 URLs)</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                                {form.image_urls.map((value, index) => (
                                    <input
                                        key={index}
                                        value={value}
                                        onChange={(e) => onChangeImage(index, e.target.value)}
                                        className="input"
                                        placeholder={`Image URL ${index + 1}${index === 0 ? ' (Primary)' : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label>Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={form.description}
                                onChange={onChange}
                                className="input"
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button className="btn btn-primary" type="submit">
                            Save
                        </button>
                        <button className="btn" type="button" onClick={() => navigate('/admin/products')}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditProduct;

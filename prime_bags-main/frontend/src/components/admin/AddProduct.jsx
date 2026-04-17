import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import productService from '../../services/productService';

const AddProduct = () => {
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
                const data = await productService.getCategories();
                setCategories(data || []);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to load categories');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

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

            await productService.createProduct(payload);
            toast.success('Product created');
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create product');
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40, textAlign: 'left' }}>
                <h2>Add Product</h2>

                <form onSubmit={onSubmit} className="card" style={{ padding: 20, marginTop: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label>Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                required
                                className="input"
                                placeholder="Product name"
                            />
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
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                value={form.price}
                                onChange={onChange}
                                required
                                className="input"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label>Stock Quantity</label>
                            <input
                                name="stock_quantity"
                                type="number"
                                value={form.stock_quantity}
                                onChange={onChange}
                                className="input"
                                placeholder="0"
                            />
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
                                value={form.description}
                                onChange={onChange}
                                rows={4}
                                className="input"
                                style={{ resize: 'vertical' }}
                                placeholder="Product description"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button className="btn btn-primary" type="submit">
                            Create
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

export default AddProduct;

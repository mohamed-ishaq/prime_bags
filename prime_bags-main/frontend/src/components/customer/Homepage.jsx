import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../common/Footer';
import LoadingSpinner from '../common/LoadingSpinner';
import Navbar from '../common/Navbar';
import productService from '../../services/productService';
import ProductCard from './ProductCard';

const Homepage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts(selectedCategory);
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryMeta = useMemo(
        () => ({
            'Travel Bags': {
                description: 'Weekend-ready duffels and travel essentials.',
                image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
            },
            'School Bags': {
                description: 'Comfortable, durable bags for daily classes.',
                image: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?w=800&auto=format&fit=crop&q=60',
            },
            'College Bags': {
                description: 'Spacious, clean design for campus life.',
                image: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?w=800&auto=format&fit=crop&q=60',
            },
            'Laptop Bags': {
                description: 'Padded protection with a premium finish.',
                image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=60',
            },
            HandBags: {
                description: 'Elegant styles for everyday carry.',
                image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60',
            },
            LunchBags: {
                description: 'Keep it fresh—compact and insulated.',
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60',
            },
            'Trucking Bags': {
                description: 'Heavy-duty options built to last.',
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60',
            },
        }),
        []
    );

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
                    <p className="text-sm font-semibold tracking-wide text-slate-600">PRIME BAGS</p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Premium collection, clean design.
                    </h1>
                    <p className="mt-3 max-w-2xl text-base text-slate-600">
                        Discover thoughtfully crafted bags made for travel, work, and everyday use.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('')}
                            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-950 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                        >
                            Browse all
                        </button>
                        {selectedCategory ? (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                                Showing: <span className="font-semibold text-slate-900">{selectedCategory}</span>
                            </span>
                        ) : (
                            <span className="text-sm text-slate-500">Showing all products.</span>
                        )}
                    </div>
                </section>

                <section className="mt-12">
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Shop by Category</h2>
                        <p className="mt-2 text-slate-600">Pick a category to filter products instantly.</p>
                    </div>

                    <div className="mt-5 categories" role="tablist" aria-label="Product categories">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('')}
                            className={['category-btn', selectedCategory === '' ? 'active' : ''].join(' ')}
                            role="tab"
                            aria-selected={selectedCategory === ''}
                            title="Browse the full Prime Bags collection."
                        >
                            All
                        </button>

                        {categories.map((category) => {
                            const meta = categoryMeta?.[category.name] || {};
                            const isActive = selectedCategory === category.name;

                            return (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={['category-btn', isActive ? 'active' : ''].join(' ')}
                                    role="tab"
                                    aria-selected={isActive}
                                    title={meta.description || category.name}
                                >
                                    {category.name}
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="mt-12 pb-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Products</h2>
                            <p className="mt-2 text-slate-600">
                                {products.length} {products.length === 1 ? 'item' : 'items'} found.
                            </p>
                        </div>
                    </div>

                    {products.length === 0 ? (
                        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                            <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                            <p className="mt-2 text-sm text-slate-600">Try another category or browse all products.</p>
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('')}
                                className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-subtle"
                            >
                                Browse all
                            </button>
                        </div>
                    ) : (
                        <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </>
    );
};

export default Homepage;

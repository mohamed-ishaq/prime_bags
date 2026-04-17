import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const getImageUrls = (product) => {
    let urls = [];

    if (Array.isArray(product?.image_urls)) urls = product.image_urls;
    else if (typeof product?.image_urls === 'string') {
        try {
            const parsed = JSON.parse(product.image_urls);
            if (Array.isArray(parsed)) urls = parsed;
        } catch {
            urls = [];
        }
    }

    if (urls.length === 0 && product?.image_url) urls = [product.image_url];

    return urls
        .map((v) => String(v || '').trim())
        .filter(Boolean)
        .slice(0, 5);
};

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const imageUrls = useMemo(() => getImageUrls(product), [product]);
    const [activeImageUrl, setActiveImageUrl] = useState(null);
    const primaryImageUrl = activeImageUrl || imageUrls[0] || product?.image_url || null;

    const inStock = Number(product?.stock_quantity || 0) > 0;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (inStock) addToCart(product.id, 1);
        else toast.error('Out of stock!');
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        if (inStock) {
            addToCart(product.id, 1);
            navigate('/customer/checkout');
        } else toast.error('Out of stock!');
    };

    return (
        <div
            className="group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-subtle"
            onClick={() => navigate(`/customer/product/${product.id}`)}
        >
            <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                <img
                    src={primaryImageUrl || 'https://via.placeholder.com/600x450?text=Prime+Bags'}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>

            {imageUrls.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto px-4 pt-3" onClick={(e) => e.stopPropagation()}>
                    {imageUrls.map((url) => {
                        const isActive = activeImageUrl === url || (!activeImageUrl && url === imageUrls[0]);
                        return (
                            <button
                                key={url}
                                type="button"
                                aria-label="View product image"
                                className={[
                                    'h-12 w-12 flex-none overflow-hidden rounded-xl border bg-white shadow-sm transition',
                                    'hover:-translate-y-0.5 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2',
                                    isActive ? 'border-accent/50 ring-2 ring-accent/20' : 'border-slate-200',
                                ].join(' ')}
                                onClick={() => setActiveImageUrl(url)}
                            >
                                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                            </button>
                        );
                    })}
                </div>
            ) : null}

            <div className="p-5">
                <h3 className="text-base font-semibold tracking-tight text-slate-900">{product.name}</h3>
                <p className="mt-1 text-xs font-medium text-slate-500">{product.category_name}</p>

                <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-lg font-bold tracking-tight text-slate-900">₹{product.price}</p>
                    <span
                        className={[
                            'rounded-full px-3 py-1 text-xs font-semibold',
                            inStock ? 'bg-success/10 text-success' : 'bg-red-50 text-red-600',
                        ].join(' ')}
                    >
                        {inStock ? `In stock (${product.stock_quantity})` : 'Out of stock'}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-accent-hover hover:shadow-subtle disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        onClick={handleAddToCart}
                        disabled={!inStock}
                    >
                        Add to Cart
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full bg-success px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-success-hover hover:shadow-subtle disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                        onClick={handleBuyNow}
                        disabled={!inStock}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

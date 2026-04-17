import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import productService from '../../services/productService';
import LoadingSpinner from '../common/LoadingSpinner';
import PremiumNavbar from '../ui/PremiumNavbar';
import PremiumFooter from '../ui/PremiumFooter';
import ProductImageGallery from '../ui/ProductImageGallery';
import QuantitySelector from '../ui/QuantitySelector';

const normalizeSpecifications = (specifications) => {
    if (!specifications) return null;

    if (typeof specifications === 'string') {
        try {
            const parsed = JSON.parse(specifications);
            return parsed && typeof parsed === 'object' ? parsed : null;
        } catch {
            return null;
        }
    }

    return typeof specifications === 'object' ? specifications : null;
};

const normalizeImageUrls = (product) => {
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

    const cleaned = urls.map((v) => String(v || '').trim()).filter(Boolean);
    return Array.from(new Set(cleaned));
};

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [activeImageUrl, setActiveImageUrl] = useState(null);

    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const [data, reviewData] = await Promise.all([
                    productService.getProductById(id),
                    productService.getProductReviews(id).catch(() => []),
                ]);
                setProduct(data);
                setReviews(Array.isArray(reviewData) ? reviewData : []);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Product not found');
                navigate('/customer');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, navigate]);

    const averageRating = useMemo(() => {
        if (!Array.isArray(reviews) || reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + Number(r?.rating || 0), 0);
        return sum / reviews.length;
    }, [reviews]);

    const myReview = useMemo(() => {
        if (!user?.id) return null;
        return (reviews || []).find((r) => Number(r?.user_id) === Number(user.id)) || null;
    }, [reviews, user?.id]);

    useEffect(() => {
        if (myReview?.rating) setReviewRating(Number(myReview.rating));
        if (typeof myReview?.comment === 'string') setReviewComment(myReview.comment);
    }, [myReview]);

    const renderStars = (rating) => {
        const value = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));
        return '★'.repeat(value) + '☆'.repeat(5 - value);
    };

    const refreshReviews = async () => {
        setReviewLoading(true);
        try {
            const data = await productService.getProductReviews(id);
            setReviews(Array.isArray(data) ? data : []);
        } catch {
            setReviews([]);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!id) return;
        setReviewSubmitting(true);
        try {
            await productService.upsertProductReview(id, {
                rating: Number(reviewRating),
                comment: reviewComment,
            });
            toast.success(myReview ? 'Review updated' : 'Review submitted');
            await refreshReviews();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const specificationsObject = useMemo(() => normalizeSpecifications(product?.specifications), [product]);
    const hasSpecifications =
        specificationsObject &&
        !Array.isArray(specificationsObject) &&
        Object.keys(specificationsObject).length > 0;

    const imageUrls = useMemo(() => normalizeImageUrls(product), [product]);

    useEffect(() => {
        if (imageUrls.length === 0) {
            setActiveImageUrl(null);
            return;
        }
        if (!activeImageUrl || !imageUrls.includes(activeImageUrl)) {
            setActiveImageUrl(imageUrls[0]);
        }
    }, [imageUrls, activeImageUrl]);

    useEffect(() => {
        const maxQty = Math.max(1, Number(product?.stock_quantity || 0));
        setQuantity((q) => Math.min(maxQty, Math.max(1, q)));
    }, [product?.stock_quantity]);

    const handleAddToCart = () => {
        if (!product) return;
        if (product.stock_quantity >= quantity) {
            addToCart(product.id, quantity);
        } else {
            toast.error('Not enough stock!');
        }
    };

    const handleBuyNow = () => {
        if (!product) return;
        if (product.stock_quantity >= quantity) {
            addToCart(product.id, quantity);
            navigate('/customer/checkout');
        } else {
            toast.error('Not enough stock!');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!product) return null;

    const maxQty = Math.max(1, Number(product.stock_quantity || 0));

    return (
        <>
            <PremiumNavbar />

            <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] bg-white/80 shadow-card ring-1 ring-black/5 backdrop-blur">
                        <div className="border-b border-slate-200/70 px-6 py-5 sm:px-8">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-soft ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-card active:translate-y-0"
                            >
                                <span aria-hidden="true">←</span>
                                Back
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-8 px-6 py-6 sm:px-8 lg:grid-cols-2 lg:gap-10">
                            <section>
                                <ProductImageGallery
                                    imageUrls={imageUrls}
                                    activeUrl={activeImageUrl}
                                    onSelect={setActiveImageUrl}
                                    alt={product.name}
                                />
                            </section>

                            <section className="space-y-6">
                                <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-7">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                                            {product.name}
                                        </h1>

                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <p className="text-2xl font-bold tracking-tight text-lime-600 sm:text-3xl">
                                                ₹{Number(product.price || 0).toFixed(2)}
                                            </p>
                                            <span className="text-sm text-slate-500">•</span>
                                            <p className="text-sm text-slate-600">
                                                {product.stock_quantity > 0
                                                    ? `In stock (${product.stock_quantity})`
                                                    : 'Out of stock'}
                                            </p>
                                        </div>

                                        {product.category_name ? (
                                            <p className="text-sm text-slate-500">Category: {product.category_name}</p>
                                        ) : null}
                                    </div>

                                    <p className="mt-5 text-sm leading-relaxed text-slate-600">
                                        {product.description || 'No description available.'}
                                    </p>

                                    <div className="mt-6 flex flex-col gap-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-sm font-semibold text-slate-900">Quantity</span>
                                            <QuantitySelector
                                                value={quantity}
                                                onChange={setQuantity}
                                                min={1}
                                                max={maxQty}
                                                disabled={product.stock_quantity === 0}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <button
                                                type="button"
                                                onClick={handleAddToCart}
                                                disabled={product.stock_quantity === 0}
                                                className="inline-flex items-center justify-center rounded-full bg-lime-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:-translate-y-0.5 hover:bg-lime-300 hover:shadow-card active:translate-y-0 disabled:opacity-50"
                                            >
                                                Add to Cart
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleBuyNow}
                                                disabled={product.stock_quantity === 0}
                                                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card active:translate-y-0 disabled:opacity-50"
                                            >
                                                Buy Now
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {hasSpecifications ? (
                                    <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-7">
                                        <h3 className="text-sm font-semibold text-slate-900">Specifications</h3>
                                        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            {Object.entries(specificationsObject).map(([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                                                >
                                                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        {key}
                                                    </dt>
                                                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                                                        {String(value)}
                                                    </dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                ) : null}

                                <div className="rounded-3xl bg-white p-6 shadow-soft ring-1 ring-black/5 sm:p-7">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">Customer Reviews</h3>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                                {reviews.length ? ` • Avg ${averageRating.toFixed(1)} / 5` : ''}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold text-amber-600">{renderStars(averageRating)}</div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                        <form onSubmit={handleSubmitReview} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                                            <p className="text-sm font-semibold text-slate-900">
                                                {myReview ? 'Update your review' : 'Write a review'}
                                            </p>
                                            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                <div>
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Rating
                                                    </label>
                                                    <select
                                                        value={reviewRating}
                                                        onChange={(e) => setReviewRating(e.target.value)}
                                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
                                                    >
                                                        {[5, 4, 3, 2, 1].map((v) => (
                                                            <option key={v} value={v}>
                                                                {v} - {renderStars(v)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Comment (optional)
                                                    </label>
                                                    <textarea
                                                        value={reviewComment}
                                                        onChange={(e) => setReviewComment(e.target.value)}
                                                        rows={3}
                                                        className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-soft focus:outline-none focus:ring-2 focus:ring-accent/30"
                                                        placeholder="Share your experience..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="mt-3 flex items-center gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={reviewSubmitting}
                                                    className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-accent-hover disabled:opacity-60"
                                                >
                                                    {reviewSubmitting ? 'Saving...' : myReview ? 'Update Review' : 'Submit Review'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={refreshReviews}
                                                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-soft transition hover:-translate-y-0.5 hover:border-slate-300"
                                                >
                                                    Refresh
                                                </button>
                                            </div>
                                            <p className="mt-3 text-xs text-slate-500">
                                                Reviews are tied to your account and can be updated anytime.
                                            </p>
                                        </form>

                                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                            {reviewLoading ? (
                                                <p className="text-sm text-slate-500">Loading reviews...</p>
                                            ) : reviews.length === 0 ? (
                                                <p className="text-sm text-slate-500">No reviews yet. Be the first to review this product.</p>
                                            ) : (
                                                <ul className="space-y-4">
                                                    {reviews.map((r) => (
                                                        <li
                                                            key={r.id}
                                                            className={[
                                                                'rounded-2xl border p-4',
                                                                Number(r.user_id) === Number(user?.id)
                                                                    ? 'border-accent/40 bg-accent/5'
                                                                    : 'border-slate-200 bg-slate-50/40',
                                                            ].join(' ')}
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                        {r.user_name || 'Customer'}
                                                                        {Number(r.user_id) === Number(user?.id) ? (
                                                                            <span className="ml-2 text-xs font-semibold text-accent">
                                                                                You
                                                                            </span>
                                                                        ) : null}
                                                                    </p>
                                                                    <p className="mt-1 text-sm font-semibold text-amber-600">
                                                                        {renderStars(r.rating)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-xs text-slate-500">
                                                                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                                                                </p>
                                                            </div>
                                                            {r.comment ? (
                                                                <p className="mt-3 text-sm leading-relaxed text-slate-700">{r.comment}</p>
                                                            ) : (
                                                                <p className="mt-3 text-sm text-slate-500">No comment provided.</p>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>

            <PremiumFooter />
        </>
    );
};

export default ProductDetail;

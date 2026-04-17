import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../common/Navbar';
import LoadingSpinner from '../common/LoadingSpinner';
import reviewService from '../../services/reviewService';

const ReviewsList = () => {
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await reviewService.getAllReviews();
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const stats = useMemo(() => {
        const count = reviews.length;
        const avg = count ? reviews.reduce((sum, r) => sum + Number(r?.rating || 0), 0) / count : 0;
        return { count, avg };
    }, [reviews]);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Navbar />
            <div className="container" style={{ paddingTop: 30, paddingBottom: 40 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ textAlign: 'left' }}>
                        <h2>Customer Reviews</h2>
                        <div style={{ marginTop: 6, color: '#555' }}>
                            {stats.count} {stats.count === 1 ? 'review' : 'reviews'} • Avg {stats.avg.toFixed(1)} / 5
                        </div>
                    </div>
                    <button className="btn" onClick={fetchReviews}>
                        Refresh
                    </button>
                </div>

                {reviews.length === 0 ? (
                    <div style={{ padding: 30, textAlign: 'left' }}>No reviews found.</div>
                ) : (
                    <div style={{ overflowX: 'auto', marginTop: 16 }}>
                        <table style={{ width: '100%', background: 'white', borderRadius: 10, borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                    <th style={{ padding: 12, width: 140 }}>Product</th>
                                    <th style={{ padding: 12, width: 160 }}>Customer</th>
                                    <th style={{ padding: 12, width: 90 }}>Rating</th>
                                    <th style={{ padding: 12 }}>Comment</th>
                                    <th style={{ padding: 12, width: 140 }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((r) => (
                                    <tr key={r.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: 12 }}>{r.product_name || `#${r.product_id}`}</td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ fontWeight: 600 }}>{r.user_name || `#${r.user_id}`}</div>
                                            <div style={{ fontSize: 12, color: '#666' }}>{r.user_email || ''}</div>
                                        </td>
                                        <td style={{ padding: 12, fontWeight: 700 }}>{Number(r.rating || 0)}/5</td>
                                        <td style={{ padding: 12 }}>{r.comment || <span style={{ color: '#777' }}>-</span>}</td>
                                        <td style={{ padding: 12 }}>
                                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default ReviewsList;


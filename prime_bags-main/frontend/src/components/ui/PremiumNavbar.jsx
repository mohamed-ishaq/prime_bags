import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const PremiumNavbar = () => {
    const { user } = useAuth();
    const { cart } = useCart();

    const cartItemCount = useMemo(() => {
        return cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    }, [cart.items]);

    return (
        <header className="sticky top-0 z-50">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    <Link to={user?.role === 'admin' ? '/admin' : '/customer'} className="select-none">
                        <span className="text-lg font-semibold tracking-tight text-white">Prime Bags</span>
                    </Link>

                    <nav className="flex items-center gap-3">
                        <Link
                            to="/customer"
                            className="rounded-full px-3 py-2 text-sm font-medium text-white/85 transition hover:text-white hover:bg-white/10"
                        >
                            Shop
                        </Link>
                        <Link
                            to="/customer/cart"
                            className="rounded-full px-3 py-2 text-sm font-medium text-white/85 transition hover:text-white hover:bg-white/10"
                        >
                            Cart ({cartItemCount})
                        </Link>
                        <button
                            type="button"
                            className="rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.99]"
                        >
                            {user?.name || 'User'}
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default PremiumNavbar;


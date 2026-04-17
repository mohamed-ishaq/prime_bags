import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { FaBars, FaShoppingCart, FaSignOutAlt, FaTimes, FaUser } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const profileRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const cartItemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

    useEffect(() => {
        const onPointerDown = (e) => {
            if (!profileRef.current) return;
            if (!profileRef.current.contains(e.target)) setProfileOpen(false);
        };

        window.addEventListener('mousedown', onPointerDown);
        window.addEventListener('touchstart', onPointerDown, { passive: true });
        return () => {
            window.removeEventListener('mousedown', onPointerDown);
            window.removeEventListener('touchstart', onPointerDown);
        };
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mobileOpen]);

    const homeHref = user?.role === 'admin' ? '/admin' : '/customer';

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between gap-3">
                    <Link
                        to={homeHref}
                        className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                    >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-950 text-sm font-bold text-white shadow-sm">
                            PB
                        </span>
                        <div className="leading-tight">
                            <span className="block text-sm font-semibold tracking-tight text-slate-900">Prime Bags</span>
                            <span className="hidden text-xs text-slate-500 sm:block">Premium quality, modern design</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
                            {user ? (
                                user.role === 'customer' ? (
                                    <>
                                        <Link className="hover:text-slate-900 transition-colors" to="/customer">
                                            Shop
                                        </Link>
                                        <Link
                                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-subtle"
                                            to="/customer/cart"
                                        >
                                            <FaShoppingCart className="text-slate-700" /> Cart
                                            <span className="ml-1 inline-flex min-w-7 justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                                                {cartItemCount}
                                            </span>
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link className="hover:text-slate-900 transition-colors" to="/admin">
                                            Dashboard
                                        </Link>
                                        <Link className="hover:text-slate-900 transition-colors" to="/admin/products">
                                            Products
                                        </Link>
                                        <Link className="hover:text-slate-900 transition-colors" to="/admin/orders">
                                            Orders
                                        </Link>
                                        <Link className="hover:text-slate-900 transition-colors" to="/admin/add-product">
                                            Add Product
                                        </Link>
                                    </>
                                )
                            ) : (
                                <Link className="hover:text-slate-900 transition-colors" to="/login">
                                    Login
                                </Link>
                            )}
                        </nav>

                        {user ? (
                            <div className="relative hidden md:block" ref={profileRef}>
                                <button
                                    type="button"
                                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                                    onClick={() => setProfileOpen((v) => !v)}
                                    aria-haspopup="menu"
                                    aria-expanded={profileOpen ? 'true' : 'false'}
                                >
                                    <FaUser className="text-slate-600" />
                                    <span className="max-w-[14ch] truncate">{user.name}</span>
                                </button>

                                {profileOpen && (
                                    <div
                                        className="absolute right-0 top-[calc(100%+12px)] w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card"
                                        role="menu"
                                    >
                                        <div className="px-4 py-3">
                                            <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                                        </div>
                                        <div className="h-px bg-slate-200/70" />
                                        <div className="p-2">
                                            {user.role === 'customer' && (
                                                <>
                                                    <Link
                                                        to="/customer/dashboard"
                                                        role="menuitem"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Profile Dashboard
                                                    </Link>
                                                    <Link
                                                        to="/customer/orders"
                                                        role="menuitem"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Orders
                                                    </Link>
                                                    <Link
                                                        to="/customer/addresses"
                                                        role="menuitem"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Saved Addresses
                                                    </Link>
                                                    <Link
                                                        to="/customer/liked"
                                                        role="menuitem"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Liked Products
                                                    </Link>
                                                    <Link
                                                        to="/customer/transactions"
                                                        role="menuitem"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                                                    >
                                                        Transactions
                                                    </Link>
                                                </>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                role="menuitem"
                                                className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-950 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2"
                                            >
                                                <FaSignOutAlt /> Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 md:hidden"
                            onClick={() => setMobileOpen((v) => !v)}
                            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={mobileOpen ? 'true' : 'false'}
                        >
                            {mobileOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>

                {mobileOpen ? (
                    <div className="pb-4 md:hidden">
                        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-subtle">
                            <div className="p-2 text-sm font-medium text-slate-700">
                                {user ? (
                                    user.role === 'customer' ? (
                                        <>
                                            <Link
                                                className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/customer"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Shop
                                            </Link>
                                            <Link
                                                className="flex items-center justify-between rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/customer/cart"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    <FaShoppingCart /> Cart
                                                </span>
                                                <span className="inline-flex min-w-7 justify-center rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                                                    {cartItemCount}
                                                </span>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/admin"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/admin/products"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Products
                                            </Link>
                                            <Link
                                                className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/admin/orders"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Orders
                                            </Link>
                                            <Link
                                                className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                to="/admin/add-product"
                                                onClick={() => setMobileOpen(false)}
                                            >
                                                Add Product
                                            </Link>
                                        </>
                                    )
                                ) : (
                                    <Link
                                        className="block rounded-xl px-3 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                        to="/login"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        Login
                                    </Link>
                                )}
                            </div>

                            {user ? (
                                <>
                                    <div className="h-px bg-slate-200/70" />
                                    <div className="p-3">
                                        <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>

                                        {user.role === 'customer' ? (
                                            <div className="mt-2 grid gap-1 text-sm font-medium text-slate-700">
                                                <Link
                                                    to="/customer/dashboard"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Profile Dashboard
                                                </Link>
                                                <Link
                                                    to="/customer/orders"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Orders
                                                </Link>
                                                <Link
                                                    to="/customer/addresses"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Saved Addresses
                                                </Link>
                                                <Link
                                                    to="/customer/liked"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Liked Products
                                                </Link>
                                                <Link
                                                    to="/customer/transactions"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="rounded-xl px-2 py-2 transition hover:bg-slate-50 hover:text-slate-900"
                                                >
                                                    Transactions
                                                </Link>
                                            </div>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                handleLogout();
                                            }}
                                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-950 hover:shadow-subtle"
                                        >
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </header>
    );
};

export default Navbar;

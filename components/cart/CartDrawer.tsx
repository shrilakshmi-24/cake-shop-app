'use client';

import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

export function CartDrawer() {
    const { items, removeFromCart, updateQuantity, isCartOpen, setCartOpen, cartTotal } = useCart();
    const router = useRouter();

    if (!isCartOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setCartOpen(false)}
            />

            {/* Drawer */}
            <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Your Cart ({items.length})</h2>
                    <button
                        onClick={() => setCartOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <span className="text-6xl">🍰</span>
                            <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                            <p className="text-gray-500">Looks like you haven't added any sweets yet.</p>
                            <button
                                onClick={() => setCartOpen(false)}
                                className="mt-4 px-6 py-2 bg-black text-white rounded-full font-bold text-sm"
                            >
                                Start Ordering
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                                    {/* Placeholder specific to shape or generic */}
                                    <span className="text-3xl">🎂</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-900 capitalize">{item.name || item.config.shape.replace('_', ' ') + ' Cake'}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 capitalize mt-1">
                                        {item.config.flavor} • {item.config.color.replace('pastel_', '')} • {item.config.weight}
                                    </p>
                                    {item.config.message && (
                                        <p className="text-xs text-gray-400 italic mt-1">"{item.config.message}"</p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded"
                                                disabled={item.quantity <= 1}
                                            >
                                                -
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <p className="font-mono font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500 font-medium">Total</span>
                            <span className="text-2xl font-bold text-gray-900 font-mono">₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => {
                                setCartOpen(false);
                                router.push('/checkout?source=cart');
                            }}
                            className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl hover:bg-rose-600 transition-all shadow-lg hover:shadow-xl transform active:scale-[0.98] shadow-rose-200 uppercase tracking-wider text-sm"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import { SessionProvider } from 'next-auth/react';
import { OrderProvider } from '@/contexts/OrderContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { CartProvider } from '@/contexts/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <OrderProvider>
                <ToastProvider>
                    <CartProvider>
                        {children}
                        <CartDrawer />
                    </CartProvider>
                </ToastProvider>
            </OrderProvider>
        </SessionProvider>
    );
}

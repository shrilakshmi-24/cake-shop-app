'use client';

import { SessionProvider } from 'next-auth/react';
import { OrderProvider } from '@/contexts/OrderContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <OrderProvider>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </OrderProvider>
        </SessionProvider>
    );
}

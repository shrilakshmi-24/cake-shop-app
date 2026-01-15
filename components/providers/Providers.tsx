'use client';

import { SessionProvider } from 'next-auth/react';
import { OrderProvider } from '@/contexts/OrderContext';
import { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <OrderProvider>
                {children}
            </OrderProvider>
        </SessionProvider>
    );
}

'use client';

import { usePathname } from 'next/navigation';

const GLOBAL_PATHS = [
    '', // Home
    'about',
    'admin',
    'login',
    'register',
    'cart',
    'checkout',
    'custom-request',
    'customization',
    'orders',
    'outlet', // Admin outlet portal
    'products',
    'test-outlet',
    'api'
];

export function ClientHeaderWrapper({ globalHeader }: { globalHeader: React.ReactNode }) {
    const pathname = usePathname();
    const segment = pathname.split('/')[1] || '';

    // If it's a global path, show the global header
    // Checks if the first segment matches any reserved global path
    if (GLOBAL_PATHS.includes(segment)) {
        return <>{globalHeader}</>;
    }

    // Otherwise, assume it's an outlet page and don't render global header
    // The OutletLayout will render its own header
    return null;
}

'use client';

import { IOutlet } from '@/lib/db/models/Outlet';
import { createContext, useContext, ReactNode } from 'react';

interface OutletContextType {
    outlet: IOutlet;
}

const OutletContext = createContext<OutletContextType | null>(null);

export function useOutlet() {
    const context = useContext(OutletContext);
    if (!context) {
        throw new Error('useOutlet must be used within an OutletProvider');
    }
    return context;
}

export function useOptionalOutlet() {
    return useContext(OutletContext);
}

export function OutletProvider({
    outlet,
    children
}: {
    outlet: IOutlet;
    children: ReactNode;
}) {
    return (
        <OutletContext.Provider value={{ outlet }}>
            {children}
        </OutletContext.Provider>
    );
}

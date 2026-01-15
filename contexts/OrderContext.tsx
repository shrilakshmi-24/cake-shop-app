'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CakeConfig } from '@/lib/types/customization';

interface OrderContextType {
    config: CakeConfig | null;
    setConfig: (config: CakeConfig) => void;
    imageFile: File | null;
    setImageFile: (file: File | null) => void;
    cakeId: string | undefined;
    setCakeId: (id: string | undefined) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<CakeConfig | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cakeId, setCakeId] = useState<string | undefined>(undefined);

    return (
        <OrderContext.Provider value={{ config, setConfig, imageFile, setImageFile, cakeId, setCakeId }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrder() {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
}

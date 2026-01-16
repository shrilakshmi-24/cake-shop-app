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
    orderType: 'EXISTING_CAKE' | 'CUSTOMIZED_CAKE' | 'IMAGE_REFERENCE_CAKE';
    setOrderType: (type: 'EXISTING_CAKE' | 'CUSTOMIZED_CAKE' | 'IMAGE_REFERENCE_CAKE') => void;
    referenceImageFile: File | null;
    setReferenceImageFile: (file: File | null) => void;
    basePrice: number;
    setBasePrice: (price: number) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<CakeConfig | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [cakeId, setCakeId] = useState<string | undefined>(undefined);
    const [orderType, setOrderType] = useState<'EXISTING_CAKE' | 'CUSTOMIZED_CAKE' | 'IMAGE_REFERENCE_CAKE'>('CUSTOMIZED_CAKE');
    const [referenceImageFile, setReferenceImageFile] = useState<File | null>(null);
    const [basePrice, setBasePrice] = useState<number>(30); // Default 30 for basic customization

    return (
        <OrderContext.Provider value={{
            config, setConfig,
            imageFile, setImageFile,
            cakeId, setCakeId,
            orderType, setOrderType,
            referenceImageFile, setReferenceImageFile,
            basePrice, setBasePrice
        }}>
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

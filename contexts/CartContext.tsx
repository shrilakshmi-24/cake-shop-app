'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CakeConfig } from '@/lib/types/customization';
import { calculatePrice, PRINT_IMAGE_COST, PriceMap } from '@/lib/utils/pricing';

export interface CartItem {
    id: string; // Unique ID for cart item
    config: CakeConfig;
    cakeId?: string; // If based on a specific product
    basePrice: number; // Snapshot of base price
    imageFile?: File | null; // For upload (Note: File objects don't persist well in localStorage, handled separately or warned)
    quantity: number;
    price: number; // Calculated unit price
    name?: string; // Optional custom name (e.g. from existing product)
    priceMap?: PriceMap; // Pricing rules used for this item
    orderType?: 'EXISTING_CAKE' | 'CUSTOMIZED_CAKE';
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, 'id' | 'price'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    setCartOpen: (open: boolean) => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setCartOpen] = useState(false);

    // Persistence
    useEffect(() => {
        // Hydrate from localStorage
        const stored = localStorage.getItem('cake_shop_cart');
        if (stored) {
            try {
                const parsedItems: CartItem[] = JSON.parse(stored);
                // Recalculate prices and validate schema
                // Note: Image Files are LOST. So we must recalculate price without image cost.
                const validItems = parsedItems.map(item => ({
                    ...item,
                    imageFile: null, // Ensure file is null (can't be undefined for consistency usually, or undefined)
                    price: calculatePrice(item.config, item.basePrice, item.priceMap) // Recalculate strict price using stored map
                }));
                setItems(validItems);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        // Save to localStorage
        // Helper to strip File objects (JSON.stringify does this automatically for File/Blob usually by ignoring or empty object, 
        // but explicit is better to avoid "structure" remaining without data)
        const itemsToSave = items.map(item => {
            const { imageFile, ...rest } = item;
            return rest;
        });
        localStorage.setItem('cake_shop_cart', JSON.stringify(itemsToSave));
    }, [items]);

    // Simple ID generator
    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addToCart = (newItem: Omit<CartItem, 'id' | 'price'>) => {
        setItems(prev => {
            // Check for duplicate
            const existingItemIndex = prev.findIndex(item =>
                item.cakeId === newItem.cakeId &&
                item.basePrice === newItem.basePrice &&
                item.imageFile === newItem.imageFile &&
                JSON.stringify(item.config) === JSON.stringify(newItem.config)
            );

            if (existingItemIndex > -1) {
                // Update quantity
                const newItems = [...prev];
                const existingItem = newItems[existingItemIndex];
                newItems[existingItemIndex] = {
                    ...existingItem,
                    quantity: existingItem.quantity + newItem.quantity
                };
                return newItems;
            }

            // Calculate price
            let price = calculatePrice(newItem.config, newItem.basePrice, newItem.priceMap);
            if (newItem.imageFile) {
                price += PRINT_IMAGE_COST;
            }

            const item: CartItem = {
                ...newItem,
                id: generateId(),
                price
            };

            return [...prev, item];
        });
        setCartOpen(true);
    };

    const removeFromCart = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
    };

    const clearCart = () => {
        setItems([]);
    };

    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setCartOpen, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

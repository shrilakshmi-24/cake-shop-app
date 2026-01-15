'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/components/ui/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<{ message: string; type: ToastType; show: boolean }>({
        message: '',
        type: 'success',
        show: false,
    });

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type, show: true });
    };

    const closeToast = () => {
        setToast((prev) => ({ ...prev, show: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Toast
                message={toast.message}
                type={toast.type}
                show={toast.show}
                onClose={closeToast}
            />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

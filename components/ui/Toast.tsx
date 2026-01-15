'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

export function Toast({ message, show, onClose }: ToastProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-bounce-in">
            <div className="bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-1">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                <span className="font-bold text-sm tracking-wide">{message}</span>
            </div>
        </div>
    );
}

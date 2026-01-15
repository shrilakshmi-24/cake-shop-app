'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

interface UserMenuProps {
    user: any;
    isAdmin: boolean;
}

export function UserMenu({ user, isAdmin }: UserMenuProps) {
    const { showToast } = useToast();

    const handleSignOut = async () => {
        showToast('You have been signed out successfully.', 'success');
        await signOut({ callbackUrl: '/' });
    };

    return (
        <div className="flex items-center gap-6">
            {/* Admin Link */}
            {isAdmin && (
                <Link
                    href="/admin/orders"
                    className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Admin
                </Link>
            )}

            {/* User Link */}
            <Link
                href="/orders"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
            >
                <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
                <span className="hidden sm:inline">My Orders</span>
            </Link>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors"
            >
                Sign Out
            </button>
        </div>
    );
}

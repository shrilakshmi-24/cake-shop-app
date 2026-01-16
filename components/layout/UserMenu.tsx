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

            {/* My Orders Link */}
            <Link
                href="/orders"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
                My Orders
            </Link>

            {/* Sign Out Button */}
            <button
                onClick={handleSignOut}
                className="text-sm font-medium text-rose-600 hover:text-rose-500 transition-colors"
            >
                Sign Out
            </button>

            {/* Profile Icon */}
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200">
                {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
        </div>
    );
}

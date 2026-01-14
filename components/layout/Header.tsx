import Link from 'next/link';
import { auth, signOut } from '@/auth';

export async function Header() {
    const session = await auth();
    const user = session?.user;
    const isAdmin = (user as any)?.role === 'admin';

    return (
        <header className="bg-white border-b border-gray-100 py-5 sticky top-0 z-50 shadow-sm/50 backdrop-blur-xl bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg shadow-red-200 shadow-lg group-hover:scale-110 transition-transform">C</div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cake Shop</h1>
                </Link>

                <nav className="flex items-center gap-6">
                    {user ? (
                        <>
                            {/* Admin Link */}
                            {isAdmin && (
                                <Link
                                    href="/admin/orders"
                                    className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Admin Dashboard
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

                            {/* Sign Out Button (Server Action) */}
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut({ redirectTo: '/' });
                                }}
                            >
                                <button className="text-sm font-medium text-red-600 hover:text-red-500 transition-colors">
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-lg shadow-gray-200 hover:shadow-gray-400"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}

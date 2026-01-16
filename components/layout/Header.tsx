import Link from 'next/link';
import { auth } from '@/auth';
import { UserMenu } from './UserMenu';

export async function Header() {
    const session = await auth();
    const user = session?.user;
    const isAdmin = (user as any)?.role === 'admin';

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-xl bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* 1. Left: Logo */}
                <Link href="/" className="flex items-center gap-3 group shrink-0">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl shadow-red-200 shadow-lg group-hover:scale-110 transition-transform">C</div>
                    <span className="text-xl font-bold text-gray-900 tracking-tight">Cake Shop</span>
                </Link>

                {/* 2. Center: Navigation */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link href="/" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                        About Us
                    </Link>
                </nav>

                {/* 3. Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {user ? (
                        <UserMenu user={user} isAdmin={isAdmin} />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-lg shadow-gray-200 hover:shadow-gray-400"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div >
        </header >
    );
}

import Link from 'next/link';
import { auth } from '@/auth';
import { UserMenu } from './UserMenu';

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
                    <div className="hidden md:flex items-center gap-6 mr-6 border-r border-gray-100 pr-6">
                        <Link href="/" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                            Home
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors">
                            About Us
                        </Link>
                    </div>

                    {user ? (
                        <UserMenu user={user} isAdmin={isAdmin} />
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
            </div >
        </header >
    );
}

import Link from 'next/link';
import { IOutlet } from '@/lib/db/models/Outlet';
import { CartButton } from '@/components/cart/CartButton';
import { UserMenu } from './UserMenu';
import { auth } from '@/auth';

interface OutletHeaderProps {
    outlet: IOutlet;
}

export async function OutletHeader({ outlet }: OutletHeaderProps) {
    const session = await auth();
    const user = session?.user;
    const isAdmin = (user as any)?.role === 'admin';

    // The home link for outlet should go to /[slug]
    const homeLink = `/${outlet.slug}`;

    return (
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm/50 backdrop-blur-xl bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* 1. Left: Logo - Outlet Context */}
                <Link href={homeLink} className="flex items-center gap-3 group shrink-0">
                    {/* Maybe distinct color or icon for outlet */}
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-blue-200 shadow-lg group-hover:scale-110 transition-transform">
                        {outlet.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">{outlet.name}</span>
                        <span className="text-xs text-gray-500 font-medium">by Cake Shop</span>
                    </div>
                </Link>

                {/* 2. Center: Navigation - Outlet Specific */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                    <Link href={homeLink} className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        Home
                    </Link>
                    {/* Outlet specific about page? or global about? For now global but maybe link back to outlet logic later */}
                    <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                        About Us
                    </Link>
                </nav>

                {/* 3. Right: Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    <CartButton />
                    {user ? (
                        <UserMenu user={user} isAdmin={isAdmin} isManager={(user as any)?.role === 'outlet_manager'} />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 hover:shadow-blue-400"
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

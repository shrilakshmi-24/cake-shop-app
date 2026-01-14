import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // 1. Check if logged in
    if (!session?.user) {
        redirect('/login?callbackUrl=/admin/orders');
    }

    // 2. Check if admin
    if ((session.user as any).role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-6">
                        You do not have permission to view this area. This section is restricted to administrators only.
                    </p>
                    <Link
                        href="/"
                        className="inline-block w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Render Admin Navbar + Children
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">ADMIN</span>
                        <span className="font-bold text-gray-900 tracking-tight">Dashboard</span>
                    </div>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/admin/orders" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                            Orders
                        </Link>
                        <Link href="/admin/cakes" className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all">
                            Products
                        </Link>
                        <Link href="/" className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all">
                            Exit
                        </Link>
                    </nav>
                </div>
            </header>

            {children}
        </div>
    );
}

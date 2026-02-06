import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import dbConnect from '@/lib/db/connect';
import Outlet from '@/lib/db/models/Outlet';

export default async function OutletLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect('/login?callbackUrl=/outlet');
    }

    if ((session.user as any).role !== 'outlet_manager') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Access Denied. You are not an Outlet Manager.</p>
            </div>
        );
    }

    // specific outlet detail fetching for display
    const outletId = (session.user as any).outletId;
    let outletName = 'Outlet Portal';

    if (outletId) {
        await dbConnect();
        const outlet = await Outlet.findById(outletId).select('name');
        if (outlet) {
            outletName = outlet.name;
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">OUTLET</span>
                        <span className="font-bold text-gray-900 tracking-tight">{outletName}</span>
                    </div>

                    <nav className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/outlet" className="text-gray-900 font-semibold">
                            Orders
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

import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { redirect } from 'next/navigation';
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    await dbConnect();

    // Fetch orders with populated cake details
    const orders = await Order.find({})
        .populate({ path: 'cakeId', select: 'name images basePrice' })
        .sort({ createdAt: -1 })
        .lean();

    // Serialize dates/IDs for client component
    const serializedOrders = orders.map((order: any) => ({
        ...order,
        _id: order._id.toString(),
        userId: order.userId.toString(),
        createdAt: order.createdAt?.toISOString(),
        updatedAt: order.updatedAt?.toISOString(),
        // Check if cakeId is populated (object) or just ID (if populate failed or not found)
        cakeId: (order.cakeId && typeof order.cakeId === 'object') ? {
            ...order.cakeId,
            _id: order.cakeId._id.toString()
        } : order.cakeId?.toString()
    }));

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Management</h1>
                        <p className="mt-1 text-sm text-gray-500">Track and update customer order status.</p>
                    </div>
                    <Link
                        href="/admin/analytics"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                        View Analytics
                    </Link>
                </div>

                <AdminOrdersTable orders={serializedOrders} />
            </div>
        </main>
    );
}

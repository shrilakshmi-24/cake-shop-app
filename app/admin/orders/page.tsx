import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { redirect } from 'next/navigation';
import { AdminOrderActions } from '@/components/admin/AdminOrderActions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    await dbConnect();

    // Fetch orders
    const orders = await Order.find({})
        .sort({ createdAt: -1 })
        .lean();

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Management</h1>
                    <p className="mt-1 text-sm text-gray-500">Track and update customer order status.</p>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-black/5 sm:rounded-2xl overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customization</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {orders.map((order: any) => {
                                // Serialize dates/IDs for client component
                                const serializedOrder = {
                                    ...order,
                                    _id: order._id.toString(),
                                    userId: order.userId.toString(),
                                    createdAt: order.createdAt?.toISOString(),
                                    updatedAt: order.updatedAt?.toISOString(),
                                    cakeId: order.cakeId?.toString()
                                };

                                return (
                                    <tr key={order._id.toString()} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {order._id.toString().substring(0, 8)}...
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {/* Ideally we would populate user name here, using ID for now */}
                                            <span className="opacity-60 text-xs">ID:</span> {order.userId.substring(0, 6)}...
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-600">
                                            <div className="flex items-center gap-3">

                                                {order.customizationSnapshot.printImageUrl && (
                                                    <Link href={order.customizationSnapshot.printImageUrl} target="_blank" className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 transition block shrink-0">
                                                        <img src={order.customizationSnapshot.printImageUrl} alt="Print" className="w-full h-full object-cover" />
                                                    </Link>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-gray-900 capitalize block flex items-center gap-2">
                                                        {order.customizationSnapshot.shape} Cake
                                                        <span className={`w-2 h-2 rounded-full ${order.customizationSnapshot.eggType === 'egg' ? 'bg-red-500' : 'bg-green-500'}`} title={order.customizationSnapshot.eggType === 'egg' ? 'Contains Egg' : 'Eggless'}></span>
                                                    </span>
                                                    <span className="block text-xs uppercase tracking-wide opacity-70 mt-0.5">
                                                        {order.customizationSnapshot.flavor} / {order.customizationSnapshot.color} / {order.customizationSnapshot.weight}
                                                    </span>
                                                </div>
                                            </div>
                                            {order.customizationSnapshot.message && (
                                                <div className="mt-1 text-xs text-gray-500 italic">"{order.customizationSnapshot.message}"</div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-gray-900">
                                            ₹{order.finalPrice.toFixed(2)}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${order.status === 'PLACED' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                                                order.status === 'ACCEPTED' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                                    order.status === 'PREPARING' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                        order.status === 'READY' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                            order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'CANCELLED' && order.rejectionReason && (
                                                <div className="text-[10px] text-red-500 mt-1 max-w-[100px] truncate" title={order.rejectionReason}>
                                                    {order.rejectionReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="View Full Details"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                        <circle cx="12" cy="12" r="3"></circle>
                                                    </svg>
                                                </Link>
                                                <AdminOrderActions order={serializedOrder} />
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-sm text-gray-500">
                                        No orders to manage.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}

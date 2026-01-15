import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Force dynamic because we read headers/cookies for auth
export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await auth();

    if (!session || !session.user) {
        redirect('/login?callbackUrl=/orders');
    }

    await dbConnect();

    // Fetch orders for current user
    const orders = await Order.find({ userId: (session.user as any).id })
        .sort({ createdAt: -1 })
        .lean();

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Your Orders</h1>
                        <p className="mt-2 text-gray-500">Track and view your past customizations.</p>
                    </div>
                    <Link
                        href="/"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 transition"
                    >
                        + Start New Order
                    </Link>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🍰</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                        <p className="mt-1 text-gray-500">Create your first custom cake today.</p>
                        <div className="mt-8">
                            <Link
                                href="/"
                                className="text-red-600 font-semibold hover:text-red-500"
                            >
                                Go to Customization &rarr;
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order: any) => (
                            <div key={order._id.toString()} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">

                                    {/* Icon / Visual */}
                                    <div className="flex items-start gap-4 md:items-center">
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border border-gray-100 bg-gray-50 overflow-hidden relative`}
                                            style={{ backgroundColor: order.customizationSnapshot.color === 'white' ? '#f9fafb' : order.customizationSnapshot.color + '10' }}
                                        >
                                            {order.customizationSnapshot.printImageUrl ? (
                                                <img src={order.customizationSnapshot.printImageUrl} alt="Custom" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">
                                                    {order.status === 'CANCELLED' ? '❌' : '🎂'}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900 capitalize">
                                                {order.customizationSnapshot.shape} Cake
                                            </h4>
                                            <p className="text-sm text-gray-500 capitalize mt-1">
                                                {order.customizationSnapshot.flavor} • {order.customizationSnapshot.design}
                                            </p>
                                            {order.customizationSnapshot.message && (
                                                <p className="text-xs text-gray-500 italic mt-1">"{order.customizationSnapshot.message}"</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-2 font-mono">
                                                ID: {order._id.toString().substring(0, 8)}...
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status & Price */}
                                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-12 w-full md:w-auto border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${order.status === 'PLACED' ? 'bg-gray-100 text-gray-600' :
                                                order.status === 'PREPARING' ? 'bg-orange-100 text-orange-700' :
                                                    order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                            {order.status === 'CANCELLED' && order.rejectionReason && (
                                                <p className="text-xs text-red-600 mt-1 max-w-[150px] leading-tight text-right ml-auto">
                                                    Reason: {order.rejectionReason}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                            <p className="text-xl font-bold text-gray-900">₹{order.finalPrice.toFixed(2)}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

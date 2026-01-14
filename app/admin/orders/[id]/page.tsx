import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    // Await params mainly for Next.js 15+ compatibility but good practice in general
    const { id } = await Promise.resolve(params);

    await dbConnect();

    // Fetch order with all details
    let order;
    try {
        order = await Order.findById(id).lean();
    } catch (e) {
        notFound();
    }

    if (!order) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Order Details</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            ID: <span className="font-mono">{order._id.toString()}</span> • {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <Link href="/admin/orders" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        &larr; Back to Orders
                    </Link>
                </div>

                <div className="bg-white shadow-xl ring-1 ring-black/5 rounded-2xl overflow-hidden">
                    {/* Status & Price Banner */}
                    <div className="bg-gray-50/50 border-b border-gray-100 p-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold border ${order.status === 'PLACED' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                    order.status === 'PREPARING' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                        order.status === 'READY' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700 border-green-200' :
                                                'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                {order.status}
                            </span>
                            {order.status === 'CANCELLED' && order.rejectionReason && (
                                <span className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
                                    Reason: {order.rejectionReason}
                                </span>
                            )}
                        </div>
                        <div className="text-3xl font-bold text-gray-900 font-mono">
                            ${order.finalPrice.toFixed(2)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Left: Customization Details */}
                        <div className="p-8 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Configuration</h3>
                                <dl className="grid grid-cols-1 gap-4">
                                    {[
                                        { label: 'Shape', value: order.customizationSnapshot.shape },
                                        { label: 'Flavor', value: order.customizationSnapshot.flavor },
                                        { label: 'Color', value: order.customizationSnapshot.color },
                                        { label: 'Design', value: order.customizationSnapshot.design },
                                    ].map((item) => (
                                        <div key={item.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <dt className="text-sm font-medium text-gray-500">{item.label}</dt>
                                            <dd className="text-sm font-bold text-gray-900 capitalize">{item.value.replace('_', ' ')}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>

                            {/* Message & Notes */}
                            {(order.customizationSnapshot.message || order.customizationSnapshot.notes) && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Instructions</h3>
                                    <div className="space-y-4">
                                        {order.customizationSnapshot.message && (
                                            <div className="bg-pink-50 p-4 rounded-xl border border-pink-100">
                                                <span className="text-xs font-bold text-pink-400 uppercase tracking-widest block mb-1">Message on Cake</span>
                                                <p className="text-lg font-serif text-pink-900">"{order.customizationSnapshot.message}"</p>
                                            </div>
                                        )}
                                        {order.customizationSnapshot.notes && (
                                            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                                                <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block mb-1">Additional Guide</span>
                                                <p className="text-sm text-yellow-900 whitespace-pre-wrap">{order.customizationSnapshot.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Print Image */}
                        <div className="p-8 bg-gray-50/30 flex flex-col">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Reference Image</h3>
                            <div className="flex-1 flex items-center justify-center min-h-[300px] border-2 border-dashed border-gray-200 rounded-2xl bg-white p-4">
                                {order.customizationSnapshot.printImageUrl ? (
                                    <Link href={order.customizationSnapshot.printImageUrl} target="_blank" className="block relative group w-full h-full">
                                        <img
                                            src={order.customizationSnapshot.printImageUrl}
                                            alt="User Print Upload"
                                            className="w-full h-full object-contain rounded-lg max-h-[500px]"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium transition-opacity">
                                                View Original
                                            </span>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <span className="block text-4xl mb-2">📷</span>
                                        <span className="text-sm">No image uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

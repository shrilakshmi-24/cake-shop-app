'use client';

import { useState, useMemo } from 'react';
import { updateOutletOrderStatus } from '@/lib/actions/outlet-order';
import Link from 'next/link';

interface Order {
    _id: string;
    status: string;
    deliveryDate: string;
    deliveryTime: string;
    customizationSnapshot: any;
    contactDetails: any;
    finalPrice: number;
    cakeId?: {
        name: string;
        images: string[];
    };
    orderType: string;
    userId: string;
    rejectionReason?: string;
}

export default function OutletOrderList({ initialOrders }: { initialOrders: Order[] }) {
    const [orders, setOrders] = useState(initialOrders);
    const [updating, setUpdating] = useState<string | null>(null);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isUrgent, setIsUrgent] = useState(false);
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    // Filter Logic
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // 1. Status Filter
            if (statusFilter !== 'ALL' && order.status !== statusFilter) {
                return false;
            }

            // 2. Urgent Filter (Due Today & Not Ready)
            if (isUrgent) {
                const todayStr = new Date().toISOString().split('T')[0];
                const orderDateStr = new Date(order.deliveryDate).toISOString().split('T')[0];
                const isToday = orderDateStr === todayStr;
                const isNotReady = !['DELIVERED', 'CANCELLED', 'READY'].includes(order.status);

                if (!isToday || !isNotReady) return false;
            }

            // 3. Date Range Filter
            if (dateStart) {
                const start = new Date(dateStart);
                const orderDate = new Date(order.deliveryDate);
                if (orderDate < start) return false;
            }
            if (dateEnd) {
                const end = new Date(dateEnd);
                const orderDate = new Date(order.deliveryDate);
                if (orderDate > end) return false;
            }

            return true;
        });
    }, [orders, statusFilter, isUrgent, dateStart, dateEnd]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            await updateOutletOrderStatus(orderId, newStatus);
            // Optimistic update
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            alert('Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    // Derived counts
    const urgentCount = orders.filter(o => {
        const todayStr = new Date().toISOString().split('T')[0];
        const orderDateStr = new Date(o.deliveryDate).toISOString().split('T')[0];
        return orderDateStr === todayStr && !['DELIVERED', 'CANCELLED', 'READY'].includes(o.status);
    }).length;

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    {/* Status Select */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PLACED">Placed</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="PREPARING">Preparing</option>
                            <option value="READY">Ready</option>
                            <option value="DELIVERED">Delivered</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-2">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">From</label>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            />
                        </div>
                        <div className="pt-6">-</div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">To</label>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                            />
                        </div>
                    </div>
                </div>

                {/* Urgent Toggle */}
                <button
                    onClick={() => setIsUrgent(!isUrgent)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${isUrgent
                        ? 'bg-red-50 border-red-200 text-red-700 shadow-sm ring-1 ring-red-500'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    <span className="relative flex h-3 w-3">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 ${urgentCount > 0 ? '' : 'hidden'}`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${urgentCount > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                    </span>
                    Urgent Orders ({urgentCount})
                </button>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm ring-1 ring-black/5 sm:rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Customization</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <div>
                                            <div className="flex items-center gap-1.5 text-indigo-700">
                                                <span className="text-xs">📅</span>
                                                <span>{new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                                                <span>⏰</span>
                                                <span>{order.deliveryTime}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        <div>{order.contactDetails.name}</div>
                                        <div className="text-xs text-gray-500">{order.contactDetails.phone}</div>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-gray-600">
                                        <div className="flex items-center gap-3">
                                            {/* Image Logic */}
                                            {order.orderType === 'EXISTING_CAKE' && order.cakeId && (
                                                <div className="relative w-12 h-12 rounded overflow-hidden border border-gray-200 shrink-0">
                                                    {(order.cakeId as any).images?.[0] ? (
                                                        <img src={(order.cakeId as any).images[0]} alt="Cake" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">🎂</div>
                                                    )}
                                                </div>
                                            )}

                                            {order.orderType !== 'EXISTING_CAKE' && order.customizationSnapshot.printImageUrl && (
                                                <Link href={order.customizationSnapshot.printImageUrl} target="_blank" className="relative w-10 h-10 rounded overflow-hidden border border-gray-200 hover:ring-2 hover:ring-indigo-500 transition block shrink-0">
                                                    <img src={order.customizationSnapshot.printImageUrl} alt="Print" className="w-full h-full object-cover" />
                                                </Link>
                                            )}

                                            <div>
                                                <span className="font-semibold text-gray-900 capitalize block flex items-center gap-2">
                                                    {order.orderType === 'EXISTING_CAKE' && (order.cakeId as any)?.name
                                                        ? (order.cakeId as any).name
                                                        : `${order.customizationSnapshot.shape} Cake`
                                                    }
                                                    <span className={`w-2 h-2 rounded-full ${order.customizationSnapshot.eggType === 'egg' ? 'bg-red-500' : 'bg-green-500'}`} title={order.customizationSnapshot.eggType === 'egg' ? 'Contains Egg' : 'Eggless'}></span>
                                                </span>

                                                {order.orderType === 'EXISTING_CAKE' ? (
                                                    <span className="block text-xs uppercase tracking-wide opacity-70 mt-0.5">
                                                        {order.customizationSnapshot.weight} • {order.customizationSnapshot.flavor}
                                                    </span>
                                                ) : (
                                                    <span className="block text-xs uppercase tracking-wide opacity-70 mt-0.5">
                                                        {order.customizationSnapshot.flavor} / {order.customizationSnapshot.color} / {order.customizationSnapshot.weight}
                                                    </span>
                                                )}
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
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="flex gap-2 mb-2">
                                                <Link
                                                    href={`/outlet/orders/${order._id}`}
                                                    className="p-1 px-3 bg-gray-100 text-gray-600 rounded text-xs font-bold hover:bg-gray-200"
                                                >
                                                    Details
                                                </Link>
                                            </div>
                                            {/* Manager Actions */}
                                            <div className="flex gap-1 flex-wrap justify-end max-w-[200px]">
                                                {['ACCEPTED', 'PREPARING', 'READY', 'DELIVERED'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(order._id, status)}
                                                        disabled={updating === order._id || order.status === status || (status === 'DELIVERED' && order.status !== 'READY')}
                                                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${order.status === status
                                                                ? 'bg-black text-white ring-1 ring-black'
                                                                : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                                            }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-8 py-16 text-center text-sm text-gray-500">
                                        No orders found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

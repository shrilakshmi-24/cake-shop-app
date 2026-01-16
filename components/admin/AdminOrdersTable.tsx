'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AdminOrderActions } from './AdminOrderActions';

interface AdminOrdersTableProps {
    orders: any[];
}

export function AdminOrdersTable({ orders }: AdminOrdersTableProps) {
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
                            {filteredOrders.map((order: any) => (
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
                                            <AdminOrderActions order={order} />
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

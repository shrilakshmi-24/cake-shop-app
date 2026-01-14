'use client';

import { useState } from 'react';
import { updateOrderStatus, rejectOrder } from '@/lib/actions/admin-order';

export function AdminOrderActions({ order }: { order: any }) {
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState('');

    const handleAccept = async () => {
        if (confirm('Accept this order and move to PREPARING?')) {
            await updateOrderStatus(order._id, 'PREPARING');
        }
    };

    const handleNext = async (nextStatus: string) => {
        await updateOrderStatus(order._id, nextStatus);
    };

    const handleReject = async () => {
        if (!reason) return alert('Please provide a reason');
        await rejectOrder(order._id, reason);
        setIsRejecting(false);
    };

    if (order.status === 'CANCELLED') {
        return <span className="text-red-500 text-xs font-bold">Cancelled</span>;
    }

    if (order.status === 'DELIVERED') {
        return <span className="text-green-600 text-xs font-bold">Completed</span>;
    }

    return (
        <div className="flex items-center gap-2 justify-end">
            {isRejecting ? (
                <div className="flex items-center gap-2 bg-red-50 p-1 rounded-lg animate-in fade-in slide-in-from-right-4">
                    <input
                        type="text"
                        placeholder="Reason..."
                        className="text-xs border-red-200 rounded px-2 py-1 w-32 focus:ring-red-500 focus:border-red-500"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        autoFocus
                    />
                    <button onClick={handleReject} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Confirm</button>
                    <button onClick={() => setIsRejecting(false)} className="text-xs text-gray-500 hover:text-gray-700">✕</button>
                </div>
            ) : (
                <>
                    {order.status === 'PLACED' && (
                        <>
                            <button
                                onClick={() => setIsRejecting(true)}
                                className="text-xs font-medium text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition"
                            >
                                Reject
                            </button>
                            <button
                                onClick={handleAccept}
                                className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-lg shadow-sm transition"
                            >
                                Accept
                            </button>
                        </>
                    )}

                    {['PREPARING', 'READY'].includes(order.status) && (
                        <button
                            onClick={() => handleNext(order.status === 'PREPARING' ? 'READY' : 'DELIVERED')}
                            className="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-lg transition-colors shadow-sm border border-blue-100"
                        >
                            Move to {order.status === 'PREPARING' ? 'Ready' : 'Delivered'} &rarr;
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

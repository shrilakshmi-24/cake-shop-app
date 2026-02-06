'use client';

import { useState } from 'react';
import { reassignOrder } from '@/lib/actions/admin-order';

interface OutletReassignmentProps {
    orderId: string;
    currentOutletId?: string;
    outlets: any[];
}

export function OutletReassignment({ orderId, currentOutletId, outlets }: OutletReassignmentProps) {
    const [selectedOutlet, setSelectedOutlet] = useState(currentOutletId || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleReassign = async () => {
        if (!selectedOutlet) return alert('Please select an outlet');
        if (selectedOutlet === currentOutletId) return;

        if (!confirm('Are you sure you want to reassign this order?')) return;

        setIsUpdating(true);
        try {
            await reassignOrder(orderId, selectedOutlet);
            alert('Order reassigned successfully');
        } catch (error) {
            alert('Failed to reassign order');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Reassign Outlet</h3>
            <div className="flex gap-2">
                <select
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                    disabled={isUpdating}
                >
                    <option value="">Select Outlet</option>
                    {outlets.map((outlet) => (
                        <option key={outlet._id} value={outlet._id}>
                            {outlet.name} ({outlet.address})
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleReassign}
                    disabled={isUpdating || selectedOutlet === currentOutletId}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isUpdating ? '...' : 'Move'}
                </button>
            </div>
        </div>
    );
}

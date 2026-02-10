'use server';

import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getOutletOrders() {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'outlet_manager') {
        throw new Error('Unauthorized');
    }

    const outletId = (session.user as { outletId?: string }).outletId;
    if (!outletId) {
        throw new Error('No outlet assigned to this manager');
    }

    await dbConnect();
    // Fetch orders for this outlet, sorted by newest first
    const orders = await Order.find({ outletId })
        .sort({ createdAt: -1 })
        .populate('cakeId', 'name images'); // Populate cake details if needed

    return JSON.parse(JSON.stringify(orders));
}

export async function updateOutletOrderStatus(orderId: string, status: string) {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== 'outlet_manager') {
        throw new Error('Unauthorized');
    }

    const outletId = (session.user as { outletId?: string }).outletId;

    await dbConnect();

    // Ensure the order belongs to this manager's outlet
    const order = await Order.findOne({ _id: orderId, outletId });
    if (!order) {
        throw new Error('Order not found or not belonging to this outlet');
    }

    order.status = status;
    await order.save();

    revalidatePath('/outlet');
    return JSON.parse(JSON.stringify(order));
}

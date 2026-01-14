'use server';

import dbConnect from '@/lib/db/connect';
import Order from '@/lib/db/models/Order';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        throw new Error('Unauthorized');
    }
}

export async function updateOrderStatus(orderId: string, status: string) {
    await checkAdmin();
    await dbConnect();

    await Order.findByIdAndUpdate(orderId, { status });
    revalidatePath('/admin/orders');
    revalidatePath('/orders');
}

export async function rejectOrder(orderId: string, reason: string) {
    await checkAdmin();
    await dbConnect();

    await Order.findByIdAndUpdate(orderId, {
        status: 'CANCELLED',
        rejectionReason: reason
    });
    revalidatePath('/admin/orders');
    revalidatePath('/orders');
}
